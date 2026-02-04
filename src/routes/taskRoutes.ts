// src/routes/taskRoutes.ts
import { Router } from "express";
import { getTasks, createTask } from "../controllers/taskController";
import { authenticateToken } from "../middlewares/authMiddleware";

const router = Router();

// ทุก Route ในนี้ต้องผ่านการตรวจ Token ก่อน
router.use(authenticateToken);

router.get("/", getTasks);
router.post("/", createTask);

export default router;
