// src/routes/taskRoutes.ts
import { Router } from "express";
import { getTasks, createTask } from "../controllers/taskController";
import { authenticateToken } from "../middlewares/authMiddleware";

const router = Router();

// บังคับว่าต้องมี Token ถึงจะเข้ามาใน Route เหล่านี้ได้
router.use(authenticateToken);

router.get("/", getTasks); // GET /tasks
router.post("/", createTask); // POST /tasks

export default router;
