"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTask = exports.updateTask = exports.createTask = exports.getTasks = void 0;
const prisma_1 = __importDefault(require("../prisma"));
// 1. ดึง Task ทั้งหมดของ User นั้นๆ
const getTasks = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const username = req.user?.username;
        console.log(`🔍 Fetching tasks for: ${username} (ID: ${userId})`);
        const tasks = await prisma_1.default.task.findMany({
            where: { userId: userId },
            orderBy: { position: 'asc' },
        });
        res.json({
            owner: username,
            data: tasks,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching tasks' });
    }
};
exports.getTasks = getTasks;
// 2. สร้าง Task ใหม่
const createTask = async (req, res) => {
    try {
        const { title, description, columnId, priority } = req.body;
        const userId = req.user?.userId;
        if (!userId)
            return res.status(401).json({ message: 'Unauthorized' });
        // หาตำแหน่งสุดท้าย เพื่อเอาไปต่อท้าย
        const lastTask = await prisma_1.default.task.findFirst({
            where: { userId, columnId }, // หาเฉพาะใน column เดียวกัน
            orderBy: { position: 'desc' },
        });
        // ถ้ามี task อยู่แล้ว ให้บวกเพิ่ม 1000, ถ้าไม่มีให้เริ่มที่ 1000
        // (ใช้เลขเยอะๆ เพื่อให้มีช่องว่างแทรกตรงกลางได้ง่าย)
        const newPosition = lastTask ? lastTask.position + 1000 : 1000;
        const newTask = await prisma_1.default.task.create({
            data: {
                title,
                description,
                columnId,
                priority: priority || 'medium',
                position: newPosition,
                userId: userId,
            },
        });
        res.status(201).json(newTask);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating task' });
    }
};
exports.createTask = createTask;
const updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, columnId, priority, position } = req.body;
        const userId = req.user?.userId;
        // 1. เช็คก่อนว่า Task นี้เป็นของ User คนนี้จริงไหม
        const existingTask = await prisma_1.default.task.findFirst({
            where: { id, userId }, // <--- ต้องตรงทั้ง ID และ Owner
        });
        if (!existingTask) {
            return res
                .status(404)
                .json({ message: 'Task not found or unauthorized' });
        }
        // 2. อัปเดตข้อมูล
        const updatedTask = await prisma_1.default.task.update({
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
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating task' });
    }
};
exports.updateTask = updateTask;
// 4. ลบ Task
const deleteTask = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId;
        // 1. เช็คความเป็นเจ้าของก่อนลบ (Safety First!)
        // ใช้ updateMany เพื่อเช็คและลบในการเรียกครั้งเดียวไม่ได้กับ delete
        // แต่ใช้ deleteMany ได้ (ถ้าเจอคือลบ, ถ้าไม่เจอก็ไม่ error แต่ได้ count 0)
        const result = await prisma_1.default.task.deleteMany({
            where: {
                id,
                userId, // <--- ลบเฉพาะถ้า id และ userId ตรงกัน
            },
        });
        if (result.count === 0) {
            return res
                .status(404)
                .json({ message: 'Task not found or unauthorized' });
        }
        res.json({ message: 'Task deleted successfully' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error deleting task' });
    }
};
exports.deleteTask = deleteTask;
