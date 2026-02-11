"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.forgotPassword = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../prisma"));
const register = async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res
                .status(400)
                .json({ message: 'Username and password are required' });
        }
        const existingUser = await prisma_1.default.user.findUnique({
            where: { username },
        });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
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
        const user = await prisma_1.default.user.findUnique({ where: { username } });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.json({
            message: 'Login successful',
            accessToken: token,
            user: { id: user.id, username: user.username },
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.login = login;
const forgotPassword = async (req, res) => {
    try {
        const { username } = req.body;
        // 1. เช็คว่ามี Username นี้จริงไหม
        const user = await prisma_1.default.user.findUnique({ where: { username } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // 2. สร้าง Token (อายุ 15 นาที)
        const resetToken = jsonwebtoken_1.default.sign({ userId: user.id, type: 'reset' }, process.env.JWT_SECRET, { expiresIn: '15m' });
        // 3. ส่ง Token กลับไปให้ Frontend ทันที (ไม่ต้องส่ง Link/Email)
        res.json({
            message: 'Token generated successfully',
            token: resetToken, // <--- Frontend เอาตัวนี้ไปใช้ต่อ
            expiresIn: '15m',
        });
    }
    catch (error) {
        console.error('Forgot Password Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.forgotPassword = forgotPassword;
const resetPassword = async (req, res) => {
    try {
        const { token, newPassword, confirmPassword } = req.body;
        if (!token || !newPassword || !confirmPassword) {
            return res.status(400).json({
                message: 'Token, new password, and confirm password are required',
            });
        }
        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }
        let decoded;
        try {
            decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        }
        catch (err) {
            return res.status(401).json({ message: 'Invalid or expired token' });
        }
        if (decoded.type !== 'reset') {
            return res.status(401).json({ message: 'Invalid token type' });
        }
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, 10);
        await prisma_1.default.user.update({
            where: { id: decoded.userId },
            data: {
                password: hashedPassword,
            },
        });
        res.json({ message: 'Password has been reset successfully' });
    }
    catch (error) {
        console.error('Reset Password Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.resetPassword = resetPassword;
