// src/middlewares/authMiddleware.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// 1. ประกาศ Type ใหม่ ให้ Express รู้จักตัวแปร "user"
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
  // 2. รับ Token จาก Header (Authorization: Bearer <token>)
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // ตัดคำว่า Bearer ออก

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. Please login first." });
  }

  try {
    // 3. ไขรหัส Token ด้วย Secret Key ของเรา
    const secret = process.env.JWT_SECRET as string;
    const decoded = jwt.verify(token, secret) as {
      userId: string;
      username: string;
    };

    // 4. ***จุดสำคัญ***: แนบข้อมูล User ใส่ไปใน Request
    // เพื่อให้ Controller ขั้นถัดไปรู้ว่า "ใคร" เป็นคนเรียก
    req.user = decoded;

    console.log(`✅ User verified: ${decoded.username}`); // Log ดูว่าใครเข้ามา
    next(); // ผ่านด่านไปได้!
  } catch (error) {
    return res.status(403).json({ message: "Invalid or expired token." });
  }
};
