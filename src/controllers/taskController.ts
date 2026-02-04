// src/controllers/taskController.ts
import { Response } from "express";
import prisma from "../prisma";
import { AuthRequest } from "../middlewares/authMiddleware";

// 1. ดึง Task ทั้งหมดของ User นั้นๆ
export const getTasks = async (
  req: AuthRequest,
  res: Response,
): Promise<any> => {
  try {
    const userId = req.user?.userId;
    const username = req.user?.username;

    console.log(`🔍 Fetching tasks for: ${username} (ID: ${userId})`);

    const tasks = await prisma.task.findMany({
      where: { userId: userId },
      orderBy: { position: "asc" },
    });

    res.json({
      owner: username,
      data: tasks,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching tasks" });
  }
};

// 2. สร้าง Task ใหม่
export const createTask = async (
  req: AuthRequest,
  res: Response,
): Promise<any> => {
  try {
    const { title, description, status, priority } = req.body;
    const userId = req.user?.userId;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    // หาตำแหน่งสุดท้าย เพื่อเอาไปต่อท้าย
    const lastTask = await prisma.task.findFirst({
      where: { userId, status }, // หาเฉพาะใน column เดียวกัน
      orderBy: { position: "desc" },
    });

    // ถ้ามี task อยู่แล้ว ให้บวกเพิ่ม 1000, ถ้าไม่มีให้เริ่มที่ 1000
    // (ใช้เลขเยอะๆ เพื่อให้มีช่องว่างแทรกตรงกลางได้ง่าย)
    const newPosition = lastTask ? lastTask.position + 1000 : 1000;

    const newTask = await prisma.task.create({
      data: {
        title,
        description,
        status: status || "todo",
        priority: priority || "medium",
        position: newPosition,
        userId: userId,
      },
    });

    res.status(201).json(newTask);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating task" });
  }
};
