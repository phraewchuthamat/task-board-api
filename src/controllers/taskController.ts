import { Response } from 'express'
import prisma from '../prisma'
import { AuthRequest } from '../middlewares/authMiddleware'

export const getTasks = async (
    req: AuthRequest,
    res: Response
): Promise<any> => {
    try {
        const userId = req.user?.userId
        const username = req.user?.username

        console.log(`🔍 Fetching tasks for: ${username} (ID: ${userId})`)

        const tasks = await prisma.task.findMany({
            where: { userId: userId },
            orderBy: { position: 'asc' },
        })

        res.json({
            owner: username,
            data: tasks,
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Error fetching tasks' })
    }
}

export const createTask = async (
    req: AuthRequest,
    res: Response
): Promise<any> => {
    try {
        const { title, description, columnId, priority } = req.body
        const userId = req.user?.userId

        if (!userId) return res.status(401).json({ message: 'Unauthorized' })

        const lastTask = await prisma.task.findFirst({
            where: { userId, columnId },
            orderBy: { position: 'desc' },
        })

        const newPosition = lastTask ? lastTask.position + 1000 : 1000

        const newTask = await prisma.task.create({
            data: {
                title,
                description,
                columnId,
                priority: priority || 'medium',
                position: newPosition,
                userId: userId,
            },
        })

        res.status(201).json(newTask)
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Error creating task' })
    }
}

export const updateTask = async (
    req: AuthRequest,
    res: Response
): Promise<any> => {
    try {
        const { id } = req.params as { id: string }
        const { title, description, columnId, priority, position } = req.body
        const userId = req.user?.userId

        const existingTask = await prisma.task.findFirst({
            where: { id, userId },
        })

        if (!existingTask) {
            return res
                .status(404)
                .json({ message: 'Task not found or unauthorized' })
        }

        const updatedTask = await prisma.task.update({
            where: { id },
            data: {
                title,
                description,
                columnId,
                priority,
                position,
            },
        })

        res.json(updatedTask)
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Error updating task' })
    }
}

export const deleteTask = async (
    req: AuthRequest,
    res: Response
): Promise<any> => {
    try {
        const { id } = req.params as { id: string }
        const userId = req.user?.userId

        const result = await prisma.task.deleteMany({
            where: {
                id,
                userId,
            },
        })

        if (result.count === 0) {
            return res
                .status(404)
                .json({ message: 'Task not found or unauthorized' })
        }

        res.json({ message: 'Task deleted successfully' })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Error deleting task' })
    }
}
