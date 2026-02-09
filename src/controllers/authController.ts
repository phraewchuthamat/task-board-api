import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from '../prisma'

export const register = async (req: Request, res: Response): Promise<any> => {
    try {
        const { username, password } = req.body

        if (!username || !password) {
            return res
                .status(400)
                .json({ message: 'Username and password are required' })
        }

        const existingUser = await prisma.user.findUnique({
            where: { username },
        })
        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists' })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const newUser = await prisma.user.create({
            data: {
                username,
                password: hashedPassword,
            },
        })

        res.status(201).json({
            message: 'User created successfully',
            user: { id: newUser.id, username: newUser.username },
        })
    } catch (error) {
        console.error('Error creating user:', error)
        res.status(500).json({ message: 'Internal server error' })
    }
}
export const login = async (req: Request, res: Response): Promise<any> => {
    try {
        const { username, password } = req.body

        const user = await prisma.user.findUnique({ where: { username } })
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' })
        }

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' })
        }

        const token = jwt.sign(
            { userId: user.id, username: user.username },
            process.env.JWT_SECRET as string,
            { expiresIn: '1d' }
        )

        res.json({
            message: 'Login successful',
            accessToken: token,
            user: { id: user.id, username: user.username },
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Internal server error' })
    }
}

export const forgotPassword = async (
    req: Request,
    res: Response
): Promise<any> => {
    try {
        const { username } = req.body

        // 1. เช็คว่ามี Username นี้จริงไหม
        const user = await prisma.user.findUnique({ where: { username } })
        if (!user) {
            return res.status(404).json({ message: 'User not found' })
        }

        // 2. สร้าง Token (อายุ 15 นาที)
        const resetToken = jwt.sign(
            { userId: user.id, type: 'reset' },
            process.env.JWT_SECRET as string,
            { expiresIn: '15m' }
        )

        // 3. ส่ง Token กลับไปให้ Frontend ทันที (ไม่ต้องส่ง Link/Email)
        res.json({
            message: 'Token generated successfully',
            token: resetToken, // <--- Frontend เอาตัวนี้ไปใช้ต่อ
            expiresIn: '15m',
        })
    } catch (error) {
        console.error('Forgot Password Error:', error)
        res.status(500).json({ message: 'Internal server error' })
    }
}

export const resetPassword = async (
    req: Request,
    res: Response
): Promise<any> => {
    try {
        // รับค่าทั้งหมดที่จำเป็น
        const { token, newPassword, confirmPassword } = req.body

        // 1. Validation พื้นฐาน
        if (!token || !newPassword || !confirmPassword) {
            return res.status(400).json({
                message:
                    'Token, new password, and confirm password are required',
            })
        }

        // 2. เช็คว่ารหัสผ่านใหม่ตรงกันไหม
        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match' })
        }

        // 3. ตรวจสอบ Token (ถูกต้องไหม? หมดอายุยัง?)
        let decoded: any
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET as string)
        } catch (err) {
            return res.status(401).json({ message: 'Invalid or expired token' })
        }

        // เช็คว่าเป็น Token แบบ 'reset' จริงไหม (กันคนเอา Access Token มามั่ว)
        if (decoded.type !== 'reset') {
            return res.status(401).json({ message: 'Invalid token type' })
        }

        // 4. Hash รหัสผ่านใหม่
        const hashedPassword = await bcrypt.hash(newPassword, 10)

        // 5. อัปเดตลง Database
        await prisma.user.update({
            where: { id: decoded.userId },
            data: {
                password: hashedPassword,
            },
        })

        res.json({ message: 'Password has been reset successfully' })
    } catch (error) {
        console.error('Reset Password Error:', error)
        res.status(500).json({ message: 'Internal server error' })
    }
}
