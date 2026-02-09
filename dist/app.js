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
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, morgan_1.default)('dev'));
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:8080'
];
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));
app.use('/auth', authRoutes_1.default);
app.use('/tasks', taskRoutes_1.default);
app.use('/columns', columnRoutes_1.default);
app.get('/', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'Task Board API is running! 🚀',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});
app.use((req, res, next) => {
    res.status(404).json({
        status: 'error',
        message: `Route not found: ${req.originalUrl}`
    });
});
app.use((err, req, res, next) => {
    console.error('❌ Server Error:', err);
    res.status(500).json({
        status: 'error',
        message: 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});
app.listen(PORT, () => {
    console.log(`\n==================================================`);
    console.log(`🚀 Server is successfully running!`);
    console.log(`--------------------------------------------------`);
    console.log(`🌍 Environment : ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Local URL   : http://localhost:${PORT}`);
    console.log(`==================================================\n`);
});
exports.default = app;
