"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../prisma"));
// Register
const register = async (req, res) => {
    try {
        const { username, password } = req.body;
        // 1. เช็คว่าส่งข้อมูลมาครบไหม
        if (!username || !password) {
            return res
                .status(400)
                .json({ message: 'Username and password are required' });
        }
        // 2. เช็คว่ามีคนใช้ชื่อนี้ไปหรือยัง
        const existingUser = await prisma_1.default.user.findUnique({
            where: { username },
        });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }
        // 3. เข้ารหัส Password (ห้ามเก็บสดๆ เด็ดขาด!)
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        // 4. บันทึกลง Database
        const newUser = await prisma_1.default.user.create({
            data: {
                username,
                password: hashedPassword,
            },
        });
        res.status(201).json({
            message: 'User created successfully',
            user: { id: newUser.id, username: newUser.username },
        });
    }
    catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        // 1. หา User ใน Database
        const user = await prisma_1.default.user.findUnique({ where: { username } });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        // 2. เช็ค Password ว่าตรงกันไหม (เทียบ Hash)
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        // 3. สร้าง JWT Token (บัตรผ่าน)
        const token = jsonwebtoken_1.default.sign({ userId: user.id, username: user.username }, // ข้อมูลที่จะฝังใน Token
        process.env.JWT_SECRET, { expiresIn: '1d' } // Token หมดอายุใน 1 วัน
        );
        res.json({ message: 'Login successful', token });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.login = login;
