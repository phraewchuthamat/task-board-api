"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const taskRoutes_1 = __importDefault(require("./routes/taskRoutes"));
const columnRoutes_1 = __importDefault(require("./routes/columnRoutes"));
// โหลดค่าจาก .env
dotenv_1.default.config();
const app = (0, express_1.default)();
// --- Middlewares ---
app.use(express_1.default.json()); // อ่าน JSON จาก Body ได้
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cors_1.default)()); // อนุญาตให้ Frontend ยิงเข้ามาได้
app.use((0, morgan_1.default)('dev')); // Log request ที่ยิงเข้ามาดูใน Terminal
// --- Routes ---
app.use('/auth', authRoutes_1.default);
app.use('/tasks', taskRoutes_1.default);
app.use('/columns', columnRoutes_1.default);
app.get('/', (req, res) => {
    res.send('Task Board API is running! 🚀');
});
// --- Start Server ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`\n====================================`);
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`🔗 http://localhost:${PORT}`);
    console.log(`====================================\n`);
});
exports.default = app;
