"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteColumn = exports.updateColumn = exports.createColumn = exports.getColumns = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const handleServerError = (res, error, context) => {
    console.error(`[${context}] Error:`, error);
    return res.status(500).json({
        message: `${context} failed.`,
        error: error instanceof Error ? error.message : 'Unknown error',
    });
};
const getColumns = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId)
            return res
                .status(401)
                .json({ message: 'Unauthorized: User ID is missing.' });
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
        handleServerError(res, error, 'Fetching columns');
    }
};
exports.getColumns = getColumns;
const createColumn = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId)
            return res
                .status(401)
                .json({ message: 'Unauthorized: User ID is missing.' });
        const { title, color } = req.body;
        if (!title || typeof title !== 'string' || title.trim().length === 0) {
            return res.status(400).json({
                message: 'Invalid input: "title" is required and must be a non-empty string.',
            });
        }
        if (color !== undefined &&
            color !== null &&
            typeof color !== 'string') {
            return res.status(400).json({
                message: 'Invalid input: "color" must be a string.',
            });
        }
        const lastColumn = await prisma_1.default.column.findFirst({
            where: { userId },
            orderBy: { position: 'desc' },
        });
        const newPosition = lastColumn ? lastColumn.position + 1000 : 1000;
        const newColumn = await prisma_1.default.column.create({
            data: {
                title: title.trim(),
                position: newPosition,
                color: color || null,
                userId,
            },
        });
        res.status(201).json(newColumn);
    }
    catch (error) {
        handleServerError(res, error, 'Creating column');
    }
};
exports.createColumn = createColumn;
const updateColumn = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId)
            return res
                .status(401)
                .json({ message: 'Unauthorized: User ID is missing.' });
        const { id } = req.params;
        if (!id || typeof id !== 'string') {
            return res.status(400).json({
                message: 'Invalid request: Column ID is required and must be a string.',
            });
        }
        const { title, position, color } = req.body;
        if (title === undefined &&
            position === undefined &&
            color === undefined) {
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
        if (position !== undefined && typeof position !== 'number') {
            return res.status(400).json({
                message: 'Invalid input: "position" must be a number.',
            });
        }
        if (color !== undefined &&
            color !== null &&
            typeof color !== 'string') {
            return res
                .status(400)
                .json({ message: 'Invalid input: "color" must be a string.' });
        }
        const existingColumn = await prisma_1.default.column.findFirst({
            where: { id, userId },
        });
        if (!existingColumn) {
            return res.status(404).json({
                message: 'Column not found or you do not have permission to update it.',
            });
        }
        const updatedColumn = await prisma_1.default.column.update({
            where: { id },
            data: {
                ...(title !== undefined && { title: title.trim() }),
                ...(position !== undefined && { position }),
                ...(color !== undefined && { color }),
            },
        });
        res.json(updatedColumn);
    }
    catch (error) {
        handleServerError(res, error, 'Updating column');
    }
};
exports.updateColumn = updateColumn;
const deleteColumn = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId)
            return res
                .status(401)
                .json({ message: 'Unauthorized: User ID is missing.' });
        const { id } = req.params;
        if (!id || typeof id !== 'string') {
            return res.status(400).json({
                message: 'Invalid request: Column ID is required and must be a string.',
            });
        }
        const result = await prisma_1.default.column.deleteMany({
            where: { id, userId },
        });
        if (result.count === 0) {
            return res.status(404).json({
                message: 'Column not found or you do not have permission to delete it.',
            });
        }
        res.json({ message: 'Column deleted successfully' });
    }
    catch (error) {
        handleServerError(res, error, 'Deleting column');
    }
};
exports.deleteColumn = deleteColumn;
