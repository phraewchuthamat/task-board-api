"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTask = exports.updateTask = exports.createTask = exports.getTasks = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const errorHandler_1 = require("../utils/errorHandler");
const getTasks = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const username = req.user?.username;
        if (!userId) {
            return res
                .status(401)
                .json({ message: 'Unauthorized: User ID is missing.' });
        }
        const tasks = await prisma_1.default.task.findMany({
            where: { userId },
            orderBy: { position: 'asc' },
        });
        res.json({
            owner: username,
            data: tasks,
        });
    }
    catch (error) {
        (0, errorHandler_1.handleServerError)(res, error, 'Fetching tasks');
    }
};
exports.getTasks = getTasks;
const createTask = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res
                .status(401)
                .json({ message: 'Unauthorized: User ID is missing.' });
        }
        const { title, description, columnId, priority } = req.body;
        if (!title || typeof title !== 'string' || title.trim().length === 0) {
            return res.status(400).json({
                message: 'Invalid input: "title" is required and must be a non-empty string.',
            });
        }
        if (!columnId || typeof columnId !== 'string') {
            return res.status(400).json({
                message: 'Invalid input: "columnId" is required and must be a string.',
            });
        }
        if (description !== undefined &&
            description !== null &&
            typeof description !== 'string') {
            return res.status(400).json({
                message: 'Invalid input: "description" must be a string.',
            });
        }
        if (priority !== undefined &&
            priority !== null &&
            typeof priority !== 'string') {
            return res.status(400).json({
                message: 'Invalid input: "priority" must be a string.',
            });
        }
        const lastTask = await prisma_1.default.task.findFirst({
            where: { userId, columnId },
            orderBy: { position: 'desc' },
        });
        const newPosition = lastTask ? lastTask.position + 1000 : 1000;
        const newTask = await prisma_1.default.task.create({
            data: {
                title: title.trim(),
                description: description || null,
                columnId,
                priority: priority || 'medium',
                position: newPosition,
                userId: userId,
            },
        });
        res.status(201).json(newTask);
    }
    catch (error) {
        (0, errorHandler_1.handleServerError)(res, error, 'Creating task');
    }
};
exports.createTask = createTask;
const updateTask = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res
                .status(401)
                .json({ message: 'Unauthorized: User ID is missing.' });
        }
        const { id } = req.params;
        if (!id || typeof id !== 'string') {
            return res
                .status(400)
                .json({ message: 'Invalid request: Task ID is required.' });
        }
        const { title, description, columnId, priority, position } = req.body;
        if (title === undefined &&
            description === undefined &&
            columnId === undefined &&
            priority === undefined &&
            position === undefined) {
            return res.status(400).json({
                message: 'Invalid input: Please provide at least one field to update.',
            });
        }
        if (title !== undefined &&
            (typeof title !== 'string' || title.trim() === '')) {
            return res.status(400).json({
                message: 'Invalid input: "title" must be a non-empty string.',
            });
        }
        if (columnId !== undefined && typeof columnId !== 'string') {
            return res.status(400).json({
                message: 'Invalid input: "columnId" must be a string.',
            });
        }
        if (position !== undefined && typeof position !== 'number') {
            return res.status(400).json({
                message: 'Invalid input: "position" must be a number.',
            });
        }
        if (priority !== undefined && typeof priority !== 'string') {
            return res.status(400).json({
                message: 'Invalid input: "priority" must be a string.',
            });
        }
        const existingTask = await prisma_1.default.task.findFirst({
            where: { id, userId },
        });
        if (!existingTask) {
            return res.status(404).json({
                message: 'Task not found or you do not have permission to update it.',
            });
        }
        const updatedTask = await prisma_1.default.task.update({
            where: { id },
            data: {
                ...(title !== undefined && { title: title.trim() }),
                ...(description !== undefined && { description }),
                ...(columnId !== undefined && { columnId }),
                ...(priority !== undefined && { priority }),
                ...(position !== undefined && { position }),
            },
        });
        res.json(updatedTask);
    }
    catch (error) {
        (0, errorHandler_1.handleServerError)(res, error, 'Updating task');
    }
};
exports.updateTask = updateTask;
const deleteTask = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res
                .status(401)
                .json({ message: 'Unauthorized: User ID is missing.' });
        }
        const { id } = req.params;
        if (!id || typeof id !== 'string') {
            return res
                .status(400)
                .json({ message: 'Invalid request: Task ID is required.' });
        }
        const result = await prisma_1.default.task.deleteMany({
            where: {
                id,
                userId,
            },
        });
        if (result.count === 0) {
            return res.status(404).json({
                message: 'Task not found or you do not have permission to delete it.',
            });
        }
        res.json({ message: 'Task deleted successfully' });
    }
    catch (error) {
        (0, errorHandler_1.handleServerError)(res, error, 'Deleting task');
    }
};
exports.deleteTask = deleteTask;
