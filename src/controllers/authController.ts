import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../prisma";

// Register
export const register = async (req: Request, res: Response): Promise<any> => {
  try {
    const { username, password } = req.body;

    // 1. เช็คว่าส่งข้อมูลมาครบไหม
    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password are required" });
    }

    // 2. เช็คว่ามีคนใช้ชื่อนี้ไปหรือยัง
    const existingUser = await prisma.user.findUnique({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    // 3. เข้ารหัส Password (ห้ามเก็บสดๆ เด็ดขาด!)
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. บันทึกลง Database
    const newUser = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
      },
    });

    res.status(201).json({
      message: "User created successfully",
      user: { id: newUser.id, username: newUser.username },
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const login = async (req: Request, res: Response): Promise<any> => {
  try {
    const { username, password } = req.body;

    // 1. หา User ใน Database
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 2. เช็ค Password ว่าตรงกันไหม (เทียบ Hash)
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 3. สร้าง JWT Token (บัตรผ่าน)
    const token = jwt.sign(
      { userId: user.id, username: user.username }, // ข้อมูลที่จะฝังใน Token
      process.env.JWT_SECRET as string,
      { expiresIn: "1d" }, // Token หมดอายุใน 1 วัน
    );

    res.json({ message: "Login successful", token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
