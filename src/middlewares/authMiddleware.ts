// src/middlewares/authMiddleware.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// ประกาศ Type เพิ่มเติมให้ Express Request รู้จัก user
export interface AuthRequest extends Request {
  user?: {
    userId: string;
    username: string;
  };
}

export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): any => {
  // 1. ดึง Token จาก Header (Format: "Bearer <token>")
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  try {
    // 2. แกะ Token ออกมาดูข้อมูล
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      userId: string;
      username: string;
    };

    // 3. แนบข้อมูล user ไปกับ request เพื่อให้ Controller เอาไปใช้ต่อได้
    req.user = decoded;
    next(); // ผ่านไปทำอย่างอื่นต่อได้
  } catch (error) {
    return res.status(403).json({ message: "Invalid token." });
  }
};
