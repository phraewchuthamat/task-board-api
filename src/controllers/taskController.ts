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
    const { title, description, columnId, priority } = req.body;
    const userId = req.user?.userId;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    // หาตำแหน่งสุดท้าย เพื่อเอาไปต่อท้าย
    const lastTask = await prisma.task.findFirst({
      where: { userId, columnId }, // หาเฉพาะใน column เดียวกัน
      orderBy: { position: "desc" },
    });

    // ถ้ามี task อยู่แล้ว ให้บวกเพิ่ม 1000, ถ้าไม่มีให้เริ่มที่ 1000
    // (ใช้เลขเยอะๆ เพื่อให้มีช่องว่างแทรกตรงกลางได้ง่าย)
    const newPosition = lastTask ? lastTask.position + 1000 : 1000;

    const newTask = await prisma.task.create({
      data: {
        title,
        description,
        columnId,
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

export const updateTask = async (
  req: AuthRequest,
  res: Response,
): Promise<any> => {
  try {
    const { id } = req.params as { id: string };
    const { title, description, columnId, priority, position } = req.body;
    const userId = req.user?.userId;

    // 1. เช็คก่อนว่า Task นี้เป็นของ User คนนี้จริงไหม
    const existingTask = await prisma.task.findFirst({
      where: { id, userId }, // <--- ต้องตรงทั้ง ID และ Owner
    });

    if (!existingTask) {
      return res
        .status(404)
        .json({ message: "Task not found or unauthorized" });
    }

    // 2. อัปเดตข้อมูล
    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        title,
        description,
        columnId,
        priority,
        position, // รับค่าตำแหน่งใหม่ (Float) สำหรับการจัดเรียง
      },
    });

    res.json(updatedTask);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating task" });
  }
};

// 4. ลบ Task
export const deleteTask = async (
  req: AuthRequest,
  res: Response,
): Promise<any> => {
  try {
    const { id } = req.params as { id: string };
    const userId = req.user?.userId;

    // 1. เช็คความเป็นเจ้าของก่อนลบ (Safety First!)
    // ใช้ updateMany เพื่อเช็คและลบในการเรียกครั้งเดียวไม่ได้กับ delete
    // แต่ใช้ deleteMany ได้ (ถ้าเจอคือลบ, ถ้าไม่เจอก็ไม่ error แต่ได้ count 0)
    const result = await prisma.task.deleteMany({
      where: {
        id,
        userId, // <--- ลบเฉพาะถ้า id และ userId ตรงกัน
      },
    });

    if (result.count === 0) {
      return res
        .status(404)
        .json({ message: "Task not found or unauthorized" });
    }

    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting task" });
  }
};
