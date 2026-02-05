"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteColumn = exports.updateColumn = exports.createColumn = exports.getColumns = void 0;
const prisma_1 = __importDefault(require("../prisma"));
// 1. ดึง Column ทั้งหมดของ User
const getColumns = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId)
            return res.status(401).json({ message: 'Unauthorized' });
        const columns = await prisma_1.default.column.findMany({
            where: { userId },
            orderBy: { position: 'asc' },
            include: {
                tasks: {
                    orderBy: { position: 'asc' },
                },
            },
        });
        res.json(columns);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching columns' });
    }
};
exports.getColumns = getColumns;
// 2. สร้าง Column ใหม่
const createColumn = async (req, res) => {
    try {
        const { title } = req.body;
        const userId = req.user?.userId;
        if (!userId)
            return res.status(401).json({ message: 'Unauthorized' });
        if (!title)
            return res.status(400).json({ message: 'Title is required' });
        // หาตำแหน่งสุดท้าย
        const lastColumn = await prisma_1.default.column.findFirst({
            where: { userId },
            orderBy: { position: 'desc' },
        });
        const newPosition = lastColumn ? lastColumn.position + 1000 : 1000;
        const newColumn = await prisma_1.default.column.create({
            data: {
                title,
                position: newPosition,
                userId,
            },
        });
        res.status(201).json(newColumn);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating column' });
    }
};
exports.createColumn = createColumn;
// 3. อัปเดต Column (เช่น เปลี่ยนชื่อ หรือ ย้ายตำแหน่ง)
const updateColumn = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, position } = req.body;
        const userId = req.user?.userId;
        if (!userId)
            return res.status(401).json({ message: 'Unauthorized' });
        const existingColumn = await prisma_1.default.column.findFirst({
            where: { id, userId },
        });
        if (!existingColumn) {
            return res
                .status(404)
                .json({ message: 'Column not found or unauthorized' });
        }
        const updatedColumn = await prisma_1.default.column.update({
            where: { id },
            data: {
                title,
                position,
            },
        });
        res.json(updatedColumn);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating column' });
    }
};
exports.updateColumn = updateColumn;
// 4. ลบ Column
const deleteColumn = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId;
        if (!userId)
            return res.status(401).json({ message: 'Unauthorized' });
        const result = await prisma_1.default.column.deleteMany({
            where: { id, userId },
        });
        if (result.count === 0) {
            return res
                .status(404)
                .json({ message: 'Column not found or unauthorized' });
        }
        res.json({ message: 'Column deleted successfully' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error deleting column' });
    }
};
exports.deleteColumn = deleteColumn;
