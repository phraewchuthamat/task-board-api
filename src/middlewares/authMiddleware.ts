import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export interface AuthRequest extends Request {
    user?: {
        userId: string
        username: string
    }
}

export const authenticateToken = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): any => {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
        return res
            .status(401)
            .json({ message: 'Access denied. Please login first.' })
    }

    try {
        const secret = process.env.JWT_SECRET as string
        const decoded = jwt.verify(token, secret) as {
            userId: string
            username: string
        }

        req.user = decoded

        console.log(`✅ User verified: ${decoded.username}`)
        next()
    } catch (error) {
        return res.status(403).json({ message: 'Invalid or expired token.' })
    }
}
