import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import dotenv from 'dotenv'
import authRoutes from './routes/authRoutes'
import taskRoutes from './routes/taskRoutes'
import columnRoutes from './routes/columnRoutes'

dotenv.config()

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(
    cors({
        origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:8080'],
        credentials: true,
    })
)
app.use(morgan('dev'))

app.use('/auth', authRoutes)
app.use('/tasks', taskRoutes)
app.use('/columns', columnRoutes)

app.get('/', (req, res) => {
    res.send('Task Board API is running! 🚀')
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log(`\n====================================`)
    console.log(`🚀 Server is running on port ${PORT}`)
    console.log(`🔗 http://localhost:${PORT}`)
    console.log(`====================================\n`)
})

export default app
