import express, { Application, Request, Response, NextFunction } from 'express'
import cors from 'cors'
import morgan from 'morgan'
import dotenv from 'dotenv'
import authRoutes from './routes/authRoutes.js'
import taskRoutes from './routes/taskRoutes.js'
import columnRoutes from './routes/columnRoutes.js'

dotenv.config()
const app: Application = express()
const PORT = process.env.PORT || 3000

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(morgan('dev'))

const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:8080',
    'https://task-board-react-ivory.vercel.app',
]

app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true)
            } else {
                callback(new Error('Not allowed by CORS'))
            }
        },
        credentials: true,
    })
)

app.use('/auth', authRoutes)
app.use('/tasks', taskRoutes)
app.use('/columns', columnRoutes)

app.get('/', (req: Request, res: Response) => {
    res.status(200).json({
        status: 'success',
        message: 'Task Board API is running! 🚀',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
    })
})

app.use((req: Request, res: Response, next: NextFunction) => {
    res.status(404).json({
        status: 'error',
        message: `Route not found: ${req.originalUrl}`,
    })
})

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('❌ Server Error:', err)
    res.status(500).json({
        status: 'error',
        message: 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    })
})

app.listen(PORT, () => {
    console.log(`\n==================================================`)
    console.log(`🚀 Server is successfully running!`)
    console.log(`--------------------------------------------------`)
    console.log(`🌍 Environment : ${process.env.NODE_ENV || 'development'}`)
    console.log(`🔗 Local URL   : http://localhost:${PORT}`)
    console.log(`==================================================\n`)
})

export default app
