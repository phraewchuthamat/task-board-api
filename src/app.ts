import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes";
import taskRoutes from "./routes/taskRoutes";
import columnRoutes from './routes/columnRoutes'

// โหลดค่าจาก .env
dotenv.config();

const app = express();

// --- Middlewares ---
app.use(express.json()); // อ่าน JSON จาก Body ได้
app.use(express.urlencoded({ extended: true }));
app.use(cors()); // อนุญาตให้ Frontend ยิงเข้ามาได้
app.use(morgan("dev")); // Log request ที่ยิงเข้ามาดูใน Terminal

// --- Routes ---
app.use("/auth", authRoutes);
app.use("/tasks", taskRoutes);
app.use('/columns', columnRoutes)

app.get("/", (req, res) => {
  res.send("Task Board API is running! 🚀");
});

// --- Start Server ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n====================================`);
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`🔗 http://localhost:${PORT}`);
  console.log(`====================================\n`);
});

export default app;
