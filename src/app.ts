import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import dotenv from 'dotenv'

// โหลดค่าจาก .env
dotenv.config()

const app = express()

// --- Middlewares ---
app.use(express.json()) // อ่าน JSON จาก Body ได้
app.use(express.urlencoded({ extended: true }))
app.use(cors()) // อนุญาตให้ Frontend ยิงเข้ามาได้
app.use(morgan('dev')) // Log request ที่ยิงเข้ามาดูใน Terminal

// --- Routes (เดี๋ยวเราจะมาเติมกัน) ---
app.get('/', (req, res) => {
    res.send('Task Board API is running! 🚀')
})

// --- Start Server ---
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log(`\n====================================`)
    console.log(`🚀 Server is running on port ${PORT}`)
    console.log(`🔗 http://localhost:${PORT}`)
    console.log(`====================================\n`)
})

export default app