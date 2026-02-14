import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from '../prisma.js'

interface AuthRequest extends Request {
    user?: {
        userId: string
    }
}

export const secret = process.env.JWT_SECRET || 'ubonmicrotech_private_key_2026'

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
    } catch (error: any) {
        console.error('Error creating user:', error)
        res.status(500).json({
            message: 'Internal server error',
            error: error.message
        })
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
            secret,
            { expiresIn: '1d' }
        )

        res.json({
            message: 'Login successful',
            accessToken: token,
            user: { id: user.id, username: user.username },
        })
    } catch (error: any) {
        console.error(error)
        res.status(500).json({
            message: 'Internal server error',
            error: error.message
        })
    }
}

export const forgotPassword = async (
    req: Request,
    res: Response
): Promise<any> => {
    try {
        const { username } = req.body

        const user = await prisma.user.findUnique({ where: { username } })
        if (!user) {
            return res.status(404).json({ message: 'User not found' })
        }

        const resetToken = jwt.sign(
            { userId: user.id, type: 'reset' },
            secret as string,
            { expiresIn: '15m' }
        )

        res.json({
            message: 'Token generated successfully',
            token: resetToken,
            expiresIn: '15m',
        })
    } catch (error: any) {
        console.error('Forgot Password Error:', error)
        res.status(500).json({
            message: 'Internal server error',
            error: error.message
        })
    }
}

export const resetPassword = async (
    req: Request,
    res: Response
): Promise<any> => {
    try {
        const { token, newPassword, confirmPassword } = req.body

        if (!token || !newPassword || !confirmPassword) {
            return res.status(400).json({
                message:
                    'Token, new password, and confirm password are required',
            })
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match' })
        }

        let decoded: any
        try {
            decoded = jwt.verify(token, secret)
        } catch (err) {
            return res.status(401).json({ message: 'Invalid or expired token' })
        }

        if (decoded.type !== 'reset') {
            return res.status(401).json({ message: 'Invalid token type' })
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10)

        await prisma.user.update({
            where: { id: decoded.userId },
            data: {
                password: hashedPassword,
            },
        })

        res.json({ message: 'Password has been reset successfully' })
    } catch (error: any) {
        console.error('Reset Password Error:', error)
        res.status(500).json({
            message: 'Internal server error',
            error: error.message
        })
    }
}

export const updateProfile = async (
    req: AuthRequest,
    res: Response
): Promise<any> => {
    try {
        const userId = req.user?.userId
        const { username } = req.body

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' })
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
        })

        if (username) {
            const existingUser = await prisma.user.findFirst({
                where: {
                    username: username,
                    NOT: { id: userId },
                },
            })
            if (existingUser) {
                return res
                    .status(400)
                    .json({ message: 'Username already taken' })
            }
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                username: username,
            },
            select: {
                id: true,
                username: true,
                createdAt: true,
            },
        })

        res.json({
            message: 'Profile updated successfully',
            user: updatedUser,
        })
    } catch (error) {
        console.error('Update Profile Error:', error)
        res.status(500).json({ message: 'Internal server error' })
    }
}

export const getProfile = async (
    req: AuthRequest,
    res: Response
): Promise<any> => {
    try {
        const userId = req.user?.userId

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' })
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                username: true,
                createdAt: true,
            },
        })

        if (!user) {
            return res.status(404).json({ message: 'User not found' })
        }

        res.json(user)
    } catch (error) {
        console.error('Get Profile Error:', error)
        res.status(500).json({ message: 'Internal server error' })
    }
}
