# 📋 Task Board API

REST API สำหรับระบบจัดการงาน (Task Management) ที่รองรับการสร้าง Column แบบ Dynamic พร้อมระบบ Authentication

## 🚀 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MySQL 8.0
- **ORM**: Prisma
- **Authentication**: JWT (JSON Web Token)
- **Password Hashing**: bcryptjs
- **Containerization**: Docker & Docker Compose

## 📁 โครงสร้างโปรเจค

```
task-board-api/
├── src/
│   ├── controllers/        # Business Logic
│   │   ├── authController.ts
│   │   ├── taskController.ts
│   │   └── columnController.ts
│   ├── routes/             # API Routes
│   │   ├── authRoutes.ts
│   │   ├── taskRoutes.ts
│   │   └── columnRoutes.ts
│   ├── middlewares/        # Middleware Functions
│   │   └── authMiddleware.ts
│   ├── prisma.ts          # Prisma Client Instance
│   └── app.ts             # Main Application
├── prisma/
│   ├── schema.prisma      # Database Schema
│   └── migrations/        # Database Migrations
├── .env                   # Environment Variables
├── docker-compose.yml     # Docker Configuration
├── Dockerfile            # Docker Build Instructions
└── package.json          # Dependencies

```

## 🗄️ Database Schema

### User
- `id` (UUID, Primary Key)
- `username` (Unique)
- `password` (Hashed)
- `createdAt`

### Column
- `id` (UUID, Primary Key)
- `title` (ชื่อ Column)
- `position` (ลำดับการแสดงผล)
- `userId` (Foreign Key → User)
- `createdAt`, `updatedAt`

### Task
- `id` (UUID, Primary Key)
- `title` (ชื่องาน)
- `description` (รายละเอียด)
- `priority` (ระดับความสำคัญ)
- `position` (ลำดับในคอลัมน์)
- `columnId` (Foreign Key → Column)
- `userId` (Foreign Key → User)
- `createdAt`, `updatedAt`

## 🔧 การติดตั้งและรัน

### วิธีที่ 1: รันด้วย Docker Compose (แนะนำ)

#### 1. Clone Repository
```bash
git clone https://github.com/phraewchuthamat/task-board-api.git
cd task-board-api
```

#### 2. สร้างไฟล์ .env
```bash
# สร้างไฟล์ .env ในโฟลเดอร์ task-board-api
DATABASE_URL="mysql://root:rootpassword@db:3306/taskboard_db"
JWT_SECRET="your_secret_key_here"
PORT=3000
```

> **หมายเหตุ**: สำหรับ Docker Compose ใช้ `@db:3306` เพราะ Docker จะใช้ชื่อ service เป็น hostname

#### 3. รัน Docker Compose
```bash
# รัน Backend + Database + Frontend พร้อมกัน
docker-compose up -d --build

# ดู Logs
docker-compose logs -f

# หยุดการทำงาน
docker-compose down

# หยุดและลบ Volume (ลบข้อมูลใน Database)
docker-compose down -v
```

#### 4. รัน Prisma Migration (ครั้งแรก)
```bash
# เข้าไปใน Container
docker exec -it taskboard-api sh

# รัน Migration
npx prisma migrate deploy

# ออกจาก Container
exit
```

#### 5. เข้าใช้งาน
- **API**: http://localhost:4000
- **Frontend**: http://localhost:8080
- **Database**: localhost:3307 (MySQL)

---

### วิธีที่ 2: รันแบบ Local Development

#### 1. ติดตั้ง Dependencies
```bash
npm install
```

#### 2. ตั้งค่า Database (MySQL)
```bash
# ติดตั้ง MySQL 8.0 บนเครื่อง หรือใช้ Docker
docker run --name mysql-taskboard -e MYSQL_ROOT_PASSWORD=rootpassword -e MYSQL_DATABASE=taskboard_db -p 3306:3306 -d mysql:8.0
```

#### 3. สร้างไฟล์ .env
```bash
DATABASE_URL="mysql://root:rootpassword@localhost:3306/taskboard_db"
JWT_SECRET="your_secret_key_here"
PORT=3000
```

#### 4. รัน Prisma Migration
```bash
# Generate Prisma Client
npx prisma generate

# รัน Migration
npx prisma migrate dev --name init

# (Optional) เปิด Prisma Studio เพื่อดูข้อมูล
npx prisma studio
```

#### 5. Build และรัน
```bash
# Build TypeScript
npm run build

# รัน Production
node dist/app.js

# หรือรันแบบ Development (ต้องเพิ่ม script ใน package.json)
npx ts-node src/app.ts
```

---

## 📡 API Endpoints

### 🔐 Authentication

#### Register (สมัครสมาชิก)
```http
POST /auth/register
Content-Type: application/json

{
  "username": "testuser",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "User created successfully",
  "user": {
    "id": "uuid",
    "username": "testuser"
  }
}
```

#### Login (เข้าสู่ระบบ)
```http
POST /auth/login
Content-Type: application/json

{
  "username": "testuser",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 📊 Columns (ต้องมี Token)

> **หมายเหตุ**: ทุก Endpoint ต้องส่ง `Authorization: Bearer <token>` ใน Header

#### ดึงข้อมูล Columns ทั้งหมด
```http
GET /columns
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": "uuid",
    "title": "To Do",
    "position": 1000,
    "userId": "uuid",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "tasks": [
      {
        "id": "uuid",
        "title": "Task 1",
        "description": "Description",
        "priority": "high",
        "position": 1000,
        "columnId": "uuid",
        "userId": "uuid",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
]
```

#### สร้าง Column ใหม่
```http
POST /columns
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "In Progress"
}
```

#### อัปเดต Column
```http
PATCH /columns/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Done",
  "position": 3000
}
```

#### ลบ Column
```http
DELETE /columns/:id
Authorization: Bearer <token>
```

---

### ✅ Tasks (ต้องมี Token)

#### ดึงข้อมูล Tasks ทั้งหมด
```http
GET /tasks
Authorization: Bearer <token>
```

**Response:**
```json
{
  "owner": "testuser",
  "data": [
    {
      "id": "uuid",
      "title": "Task 1",
      "description": "Description",
      "priority": "high",
      "position": 1000,
      "columnId": "uuid",
      "userId": "uuid",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### สร้าง Task ใหม่
```http
POST /tasks
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "New Task",
  "description": "Task description",
  "columnId": "uuid",
  "priority": "medium"
}
```

#### อัปเดต Task
```http
PATCH /tasks/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Task",
  "description": "Updated description",
  "columnId": "new-column-uuid",
  "priority": "high",
  "position": 2000
}
```

#### ลบ Task
```http
DELETE /tasks/:id
Authorization: Bearer <token>
```

---

## 🛠️ คำสั่งที่ใช้บ่อย

### Prisma Commands
```bash
# Generate Prisma Client
npx prisma generate

# Create Migration
npx prisma migrate dev --name migration_name

# Deploy Migration (Production)
npx prisma migrate deploy

# Reset Database (ลบข้อมูลทั้งหมด)
npx prisma migrate reset

# Open Prisma Studio (GUI สำหรับดูข้อมูล)
npx prisma studio
```

### Docker Commands
```bash
# Build และรัน
docker-compose up -d --build

# ดู Logs
docker-compose logs -f api

# Restart Service
docker-compose restart api

# เข้าไปใน Container
docker exec -it taskboard-api sh

# หยุดทุก Service
docker-compose down

# ลบทั้ง Container และ Volume
docker-compose down -v
```

### TypeScript Commands
```bash
# Build
npm run build

# Watch Mode (ต้องเพิ่ม script)
npm run dev
```

---

## 🔒 Security Features

- ✅ Password Hashing ด้วย bcryptjs
- ✅ JWT Authentication
- ✅ CORS Configuration
- ✅ Environment Variables
- ✅ User Authorization (แต่ละ User เห็นเฉพาะข้อมูลของตัวเอง)

---

## 🌐 CORS Configuration

API รองรับ CORS สำหรับ Frontend ที่รันบน:
- `http://localhost:5173` (Vite Dev Server)
- `http://localhost:5174`
- `http://localhost:8080` (Docker Frontend)

---

## 📝 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | MySQL Connection String | `mysql://root:password@localhost:3306/taskboard_db` |
| `JWT_SECRET` | Secret Key สำหรับ JWT | `your_secret_key_here` |
| `PORT` | Port ที่ API จะรัน | `3000` |

---

## 🐛 Troubleshooting

### ปัญหา: Database Connection Failed
```bash
# ตรวจสอบว่า MySQL รันอยู่หรือไม่
docker ps

# ตรวจสอบ DATABASE_URL ใน .env
cat .env
```

### ปัญหา: Prisma Client ไม่ทำงาน
```bash
# Generate Prisma Client ใหม่
npx prisma generate
```

### ปัญหา: Port ถูกใช้งานแล้ว
```bash
# ตรวจสอบ Process ที่ใช้ Port
# Windows
netstat -ano | findstr :3000

# Linux/Mac
lsof -i :3000

# เปลี่ยน PORT ใน .env
PORT=3001
```

### ปัญหา: Docker Build Failed
```bash
# ลบ Cache และ Build ใหม่
docker-compose build --no-cache

# ลบ Image และ Container ทั้งหมด
docker-compose down --rmi all
docker-compose up -d --build
```

---

## 📚 เพิ่ม Scripts ใน package.json (แนะนำ)

เพิ่ม scripts เหล่านี้ใน `package.json` เพื่อความสะดวก:

```json
{
  "scripts": {
    "dev": "ts-node src/app.ts",
    "build": "tsc",
    "start": "node dist/app.js",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:studio": "prisma studio",
    "docker:up": "docker-compose up -d --build",
    "docker:down": "docker-compose down",
    "docker:logs": "docker-compose logs -f"
  }
}
```

จากนั้นสามารถรันได้ง่ายๆ:
```bash
npm run dev          # รันแบบ Development
npm run build        # Build TypeScript
npm start            # รัน Production
npm run docker:up    # รัน Docker
```

---

## 👨‍💻 Author

**Phraew Chuthamat**
- GitHub: [@phraewchuthamat](https://github.com/phraewchuthamat)
- Repository: [task-board-api](https://github.com/phraewchuthamat/task-board-api)

---

## 📄 License

ISC

---

## 🎯 Next Steps

- [ ] เพิ่ม Unit Tests
- [ ] เพิ่ม API Documentation (Swagger)
- [ ] เพิ่ม Rate Limiting
- [ ] เพิ่ม Input Validation (express-validator)
- [ ] เพิ่ม Logging System
- [ ] Deploy to Production (AWS, Heroku, Railway)

---

**Happy Coding! 🚀**
