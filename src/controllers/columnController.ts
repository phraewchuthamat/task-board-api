import { Response } from 'express'
import prisma from '../prisma'
import { AuthRequest } from '../middlewares/authMiddleware'

// 1. ดึง Column ทั้งหมดของ User
export const getColumns = async (
    req: AuthRequest,
    res: Response
): Promise<any> => {
    try {
        const userId = req.user?.userId
        if (!userId) return res.status(401).json({ message: 'Unauthorized' })

        const columns = await prisma.column.findMany({
            where: { userId },
            orderBy: { position: 'asc' },
            include: {
                tasks: {
                    orderBy: { position: 'asc' },
                },
            },
        })

        res.json(columns)
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Error fetching columns' })
    }
}

// 2. สร้าง Column ใหม่
export const createColumn = async (
    req: AuthRequest,
    res: Response
): Promise<any> => {
    try {
        const { title } = req.body
        const userId = req.user?.userId

        if (!userId) return res.status(401).json({ message: 'Unauthorized' })
        if (!title)
            return res.status(400).json({ message: 'Title is required' })

        // หาตำแหน่งสุดท้าย
        const lastColumn = await prisma.column.findFirst({
            where: { userId },
            orderBy: { position: 'desc' },
        })

        const newPosition = lastColumn ? lastColumn.position + 1000 : 1000

        const newColumn = await prisma.column.create({
            data: {
                title,
                position: newPosition,
                userId,
            },
        })

        res.status(201).json(newColumn)
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Error creating column' })
    }
}

// 3. อัปเดต Column (เช่น เปลี่ยนชื่อ หรือ ย้ายตำแหน่ง)
export const updateColumn = async (
    req: AuthRequest,
    res: Response
): Promise<any> => {
    try {
        const { id } = req.params as { id: string }
        const { title, position } = req.body
        const userId = req.user?.userId

        if (!userId) return res.status(401).json({ message: 'Unauthorized' })

        const existingColumn = await prisma.column.findFirst({
            where: { id, userId },
        })

        if (!existingColumn) {
            return res
                .status(404)
                .json({ message: 'Column not found or unauthorized' })
        }

        const updatedColumn = await prisma.column.update({
            where: { id },
            data: {
                title,
                position,
            },
        })

        res.json(updatedColumn)
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Error updating column' })
    }
}

// 4. ลบ Column
export const deleteColumn = async (
    req: AuthRequest,
    res: Response
): Promise<any> => {
    try {
        const { id } = req.params as { id: string }
        const userId = req.user?.userId

        if (!userId) return res.status(401).json({ message: 'Unauthorized' })

        const result = await prisma.column.deleteMany({
            where: { id, userId },
        })

        if (result.count === 0) {
            return res
                .status(404)
                .json({ message: 'Column not found or unauthorized' })
        }

        res.json({ message: 'Column deleted successfully' })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Error deleting column' })
    }
}
