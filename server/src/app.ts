import express, { Application, Request, Response, NextFunction } from 'express'
import path from 'path'
import globalErrorHandler from './middleware/globalErrorHandler'
import responseMessage from './constants/responseMessage'
import ApiError from './utils/ApiError'
import helmet from 'helmet'
import cors from 'cors'
import config from './config/config'
import cookieParser from 'cookie-parser'

import healthRouter from './router/healthCheck'
import awsRouter from './router/s3FileHandler'
import authRouter from './router/auth'
import authentication from './middleware/authentication'
import mailRouter from './router/mailer'
import instiutionRouter from './router/institution'
import userouter from './router/user'
import recommendationsRouter from './router/recommendations'
import counsellingRouter from './router/counselling'

const app: Application = express()

//Middlewares
app.use(helmet())
app.use(cookieParser())
app.use(
    cors({
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
        origin: [config.CLIENT_URL as string],
        credentials: true
    })
)
app.use(express.json())
app.use(express.static(path.join(__dirname, '../', 'public')))

// Open Routes
app.use('/api/v1/auth', authRouter)
app.use('/api/v1/s3', awsRouter)
app.use('/api/v1/send/email', mailRouter)
app.use('/api/v1/institution', instiutionRouter)

// Restricted Routes
app.use(authentication)
app.use('/api/v1/health', healthRouter)
app.use('/api/v1/user', userouter)
app.use('/api/v1/recommendations', recommendationsRouter)
app.use('/api/v1/counselling', counsellingRouter)

// 404 hander
app.use((req: Request, _: Response, next: NextFunction) => {
    try {
        throw new Error(responseMessage.NOT_FOUND('Route'))
    } catch (error) {
        ApiError(next, error, req, 404)
    }
})

// Global Error Handler
app.use(globalErrorHandler)

export default app
