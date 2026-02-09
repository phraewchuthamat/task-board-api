# 📋 Task Board API

> **ระบบจัดการงานแบบ Kanban Board ที่ยืดหยุ่น ปลอดภัย และพร้อมใช้งานจริง**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Latest-green)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.x-lightgrey)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6.19-blueviolet)](https://www.prisma.io/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue)](https://www.docker.com/)

---

## 🎯 ปัญหาที่พบ: ทำไมต้องสร้างระบบนี้?

### ความท้าทายในการจัดการงาน

ในยุคที่ทีมงานต้องทำงานร่วมกันแบบ Remote และต้องการความยืดหยุ่นในการจัดการงาน เราพบปัญหาหลักๆ ดังนี้:

1. **ขาดความยืดหยุ่น** 📌
   - ระบบจัดการงานส่วนใหญ่มีโครงสร้างคอลัมน์ที่ตายตัว (To Do, In Progress, Done)
   - ไม่สามารถปรับเปลี่ยนขั้นตอนการทำงานให้เหมาะกับทีมแต่ละทีมได้

2. **ความปลอดภัยไม่เพียงพอ** 🔒
   - ข้อมูลของแต่ละคนอาจถูกเข้าถึงโดยผู้ที่ไม่เกี่ยวข้อง
   - ไม่มีระบบยืนยันตัวตนที่แข็งแกร่ง

3. **ยากต่อการ Deploy** 🚀
   - ต้องติดตั้งหลายอย่าง ซับซ้อน
   - ไม่มีระบบ Containerization ที่พร้อมใช้งาน

4. **ไม่เหมาะกับการพัฒนาต่อยอด** 🛠️
   - โค้ดไม่เป็นระเบียบ มี Code Duplication
   - ขาดการจัดการ Environment Variables ที่ดี

---

## 💡 วิธีแก้ปัญหา: เราสร้างอะไรขึ้นมา?

### สถาปัตยกรรมที่ออกแบบมาอย่างพิถีพิถัน

เราพัฒนา **Task Board API** ด้วยหลักการสำคัญ 4 ข้อ:

#### 1. **ความยืดหยุ่นสูงสุด** (Dynamic Columns)

แทนที่จะบังคับให้ใช้คอลัมน์ที่กำหนดไว้ เราให้ผู้ใช้สร้างและจัดการคอลัมน์ได้เอง:

```typescript
// ผู้ใช้สามารถสร้างคอลัมน์ตามต้องการ
POST /columns
{
  "title": "กำลังรอ Review",
  "color": "#FF6B6B"
}

// จัดเรียงลำดับได้ตามใจชอบ
PATCH /columns/:id
{
  "position": 2500
}
```

**ผลลัพธ์:** ทีมงานสามารถปรับ Workflow ให้เข้ากับวิธีทำงานของตัวเองได้ 100%

#### 2. **ความปลอดภัยระดับสูง** (Security First)

เราใส่ใจเรื่องความปลอดภัยตั้งแต่เริ่มต้น:

- ✅ **Password Hashing** ด้วย bcryptjs (10 rounds)
- ✅ **JWT Authentication** ที่แข็งแกร่ง (128-character secret)
- ✅ **User Authorization** - แต่ละคนเห็นเฉพาะข้อมูลของตัวเอง
- ✅ **Environment Variables** - ไม่มี Secrets hardcoded ในโค้ด
- ✅ **CORS Configuration** - ควบคุมการเข้าถึงจาก Frontend

```typescript
// ทุก Request ต้องผ่านการยืนยันตัวตน
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

// ระบบตรวจสอบว่าผู้ใช้มีสิทธิ์เข้าถึงข้อมูลหรือไม่
if (task.userId !== req.user.userId) {
  return res.status(403).json({ message: 'Forbidden' })
}
```

#### 3. **พร้อม Deploy ทันที** (Docker-Ready)

ใช้ Docker Compose เพียงคำสั่งเดียว ระบบทั้งหมดพร้อมใช้งาน:

```bash
docker-compose up -d --build
```

ระบบจะติดตั้งและรันให้อัตโนมัติ:
- 🗄️ MySQL Database (พร้อม Volume สำหรับเก็บข้อมูล)
- 🔧 Backend API (TypeScript + Express)
- 🌐 Frontend Web (React Application)

**ผลลัพธ์:** จาก "ติดตั้งยาก" เป็น "รันได้ใน 30 วินาที"

#### 4. **โค้ดคุณภาพสูง** (Clean Architecture)

เราปรับปรุงโค้ดให้:
- 📦 **Modular Design** - แยก Controllers, Routes, Middlewares, Utilities
- ♻️ **No Code Duplication** - ใช้ Shared Error Handler
- 🎯 **Type Safety** - TypeScript ทั้งโปรเจกต์
- 📝 **Clear Naming** - ตัวแปรและฟังก์ชันมีชื่อที่สื่อความหมาย

```
src/
├── controllers/       # Business Logic
│   ├── authController.ts
│   ├── columnController.ts
│   └── taskController.ts
├── routes/           # API Endpoints
├── middlewares/      # Authentication & Validation
├── utils/            # Shared Utilities
│   └── errorHandler.ts  # Centralized Error Handling
└── app.ts           # Application Entry Point
```

---

## 🎨 เทคโนโลยีที่ใช้

เราเลือกใช้เทคโนโลยีที่ดีที่สุดและเหมาะสมที่สุดสำหรับแต่ละส่วน:

| เทคโนโลยี | เหตุผลที่เลือก | ประโยชน์ |
|-----------|----------------|----------|
| **TypeScript** | Type Safety, Better Developer Experience | ลดบั๊ก, เขียนโค้ดได้เร็วขึ้น |
| **Express.js** | Lightweight, Flexible, มี Community ใหญ่ | พัฒนาได้รวดเร็ว, มี Library เยอะ |
| **Prisma ORM** | Type-Safe Database Access, Auto Migration | ไม่ต้องเขียน SQL เอง, ปลอดภัย |
| **MySQL 8.0** | Reliable, Scalable, มี JSON Support | เหมาะกับ Production |
| **JWT** | Stateless Authentication | Scale ได้ง่าย, ไม่ต้องเก็บ Session |
| **Docker** | Consistent Environment | รันได้เหมือนกันทุกเครื่อง |

---

## ✨ ผลลัพธ์: ได้อะไรบ้าง?

### ระบบที่ใช้งานได้จริง พร้อมทุกอย่าง

#### 📊 ฟีเจอร์หลัก

✅ **ระบบ Authentication ที่สมบูรณ์**
- สมัครสมาชิก (Register)
- เข้าสู่ระบบ (Login)
- ยืนยันตัวตนด้วย JWT Token

✅ **จัดการ Columns แบบ Dynamic**
- สร้าง/แก้ไข/ลบ Column ได้ไม่จำกัด
- จัดเรียงลำดับตามต้องการ
- กำหนดสีให้แต่ละ Column

✅ **จัดการ Tasks อย่างมีประสิทธิภาพ**
- สร้าง Task พร้อมรายละเอียด
- ย้าย Task ระหว่าง Column
- กำหนดระดับความสำคัญ (Priority)
- จัดเรียงลำดับภายใน Column

✅ **ความปลอดภัยระดับสูง**
- แต่ละผู้ใช้เห็นเฉพาะข้อมูลของตัวเอง
- Password ถูก Hash อย่างปลอดภัย
- JWT Secret แข็งแกร่ง (128 characters)
- ไม่มี Credentials hardcoded

#### 🚀 API Endpoints ที่พร้อมใช้งาน

```http
# Authentication
POST   /auth/register          # สมัครสมาชิก
POST   /auth/login             # เข้าสู่ระบบ

# Columns (ต้องมี Token)
GET    /columns                # ดึงข้อมูล Columns ทั้งหมด (พร้อม Tasks)
POST   /columns                # สร้าง Column ใหม่
PATCH  /columns/:id            # แก้ไข Column
DELETE /columns/:id            # ลบ Column

# Tasks (ต้องมี Token)
GET    /tasks                  # ดึงข้อมูล Tasks ทั้งหมด
POST   /tasks                  # สร้าง Task ใหม่
PATCH  /tasks/:id              # แก้ไข Task (รวมย้าย Column)
DELETE /tasks/:id              # ลบ Task
```

#### 📈 ประสิทธิภาพและความน่าเชื่อถือ

- ⚡ **Build Time**: ~30 วินาที
- 🔄 **Auto Restart**: Docker รองรับ restart policy
- 💾 **Data Persistence**: ข้อมูลเก็บใน Docker Volume
- 🔍 **Database Indexing**: Optimized queries ด้วย Prisma

---

## 🚀 เริ่มต้นใช้งาน

### วิธีที่ 1: Docker Compose (แนะนำ - ง่ายที่สุด)

```bash
# 1. Clone โปรเจกต์
git clone https://github.com/phraewchuthamat/task-board-api.git
cd task-board-api

# 2. สร้างไฟล์ .env (Copy จาก .env.example)
cp .env.example .env

# 3. รันทั้งระบบ (Database + API + Frontend)
docker-compose up -d --build

# 4. เข้าใช้งาน
# - Frontend: http://localhost:8080
# - API: http://localhost:4000
# - Database: localhost:3307
```

**เท่านี้ก็เสร็จแล้ว!** ⚡

### วิธีที่ 2: Local Development

```bash
# 1. ติดตั้ง Dependencies
npm install

# 2. ตั้งค่า Database (ใช้ Docker หรือติดตั้งเอง)
docker run --name mysql-taskboard \
  -e MYSQL_ROOT_PASSWORD=rootpassword \
  -e MYSQL_DATABASE=taskboard_db \
  -p 3306:3306 -d mysql:8.0

# 3. สร้างไฟล์ .env
DATABASE_URL="mysql://root:rootpassword@localhost:3306/taskboard_db"
JWT_SECRET="your-strong-secret-here"
PORT=4000

# 4. รัน Prisma Migration
npx prisma generate
npx prisma migrate dev

# 5. รัน Development Server
npm run dev
```

---

## 📖 ตัวอย่างการใช้งาน

### 1. สมัครสมาชิกและเข้าสู่ระบบ

```bash
# สมัครสมาชิก
curl -X POST http://localhost:4000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john",
    "password": "securepassword123"
  }'

# เข้าสู่ระบบ
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john",
    "password": "securepassword123"
  }'

# Response: { "accessToken": "eyJhbG..." }
```

### 2. สร้าง Workflow ของคุณเอง

```bash
# สร้าง Column แรก
curl -X POST http://localhost:4000/columns \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "📝 To Do",
    "color": "#FF6B6B"
  }'

# สร้าง Column ที่สอง
curl -X POST http://localhost:4000/columns \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "🔨 In Progress",
    "color": "#4ECDC4"
  }'

# สร้าง Column ที่สาม
curl -X POST http://localhost:4000/columns \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "✅ Done",
    "color": "#95E1D3"
  }'
```

### 3. สร้างและจัดการ Tasks

```bash
# สร้าง Task
curl -X POST http://localhost:4000/tasks \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "เขียน README",
    "description": "เขียน Documentation ให้สวยงาม",
    "columnId": "COLUMN_ID",
    "priority": "high"
  }'

# ย้าย Task ไป Column อื่น
curl -X PATCH http://localhost:4000/tasks/TASK_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "columnId": "NEW_COLUMN_ID"
  }'
```

---

## 🗄️ โครงสร้างฐานข้อมูล

```mermaid
erDiagram
    User ||--o{ Column : creates
    User ||--o{ Task : creates
    Column ||--o{ Task : contains
    
    User {
        string id PK
        string username UK
        string password
        datetime createdAt
    }
    
    Column {
        string id PK
        string title
        float position
        string color
        string userId FK
        datetime createdAt
        datetime updatedAt
    }
    
    Task {
        string id PK
        string title
        text description
        string priority
        float position
        string columnId FK
        string userId FK
        datetime createdAt
        datetime updatedAt
    }
```

---

## 🔒 ความปลอดภัย

### มาตรการความปลอดภัยที่ใช้

| มาตรการ | รายละเอียด | ประโยชน์ |
|---------|-----------|----------|
| **Password Hashing** | bcryptjs (10 rounds) | Password ไม่ถูกเก็บแบบ plaintext |
| **JWT Authentication** | 128-character secret | Token ปลอมแปลงยาก |
| **Environment Variables** | ไม่มี secrets ใน code | ปลอดภัยใน version control |
| **User Authorization** | ตรวจสอบ userId ทุก request | แต่ละคนเห็นเฉพาะข้อมูลตัวเอง |
| **CORS Configuration** | Whitelist allowed origins | ป้องกันการเข้าถึงจากแหล่งที่ไม่ได้รับอนุญาต |
| **Input Validation** | ตรวจสอบ type และ format | ป้องกัน SQL Injection |

### การจัดการ Secrets

```bash
# ❌ ไม่ควรทำ
JWT_SECRET="weak_secret"  # ใน code

# ✅ ควรทำ
# ใช้ .env file (gitignored)
JWT_SECRET="13969a20ce1b6a14b0ac15cb71c88def..."

# สร้าง strong secret ด้วย
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## 🛠️ คำสั่งที่ใช้บ่อย

### Docker Commands

```bash
# รันทั้งระบบ
npm run docker:up

# ดู logs
npm run docker:logs

# หยุดระบบ
npm run docker:down

# Restart API
docker-compose restart api

# เข้าไปใน Container
docker exec -it taskboard-api sh
```

### Prisma Commands

```bash
# Generate Prisma Client
npm run prisma:generate

# สร้าง Migration
npm run prisma:migrate

# เปิด Prisma Studio (GUI)
npm run prisma:studio

# Reset Database
npx prisma migrate reset
```

### Development Commands

```bash
# รัน Development Server
npm run dev

# Build Production
npm run build

# รัน Production
npm start
```

---

## 📊 สถิติโปรเจกต์

- 📝 **Lines of Code**: ~1,500 lines (TypeScript)
- 🗂️ **API Endpoints**: 11 endpoints
- 🔧 **Controllers**: 3 (Auth, Column, Task)
- 🛡️ **Middlewares**: 1 (Authentication)
- 🗄️ **Database Models**: 3 (User, Column, Task)
- ⚡ **Build Time**: ~30 seconds
- 🐳 **Docker Images**: 3 (DB, API, Web)

---

## 🎯 Roadmap

### ✅ เสร็จแล้ว
- [x] Dynamic Columns System
- [x] JWT Authentication
- [x] Docker Deployment
- [x] Security Improvements
- [x] Code Refactoring
- [x] Comprehensive Documentation

### 🚧 กำลังพัฒนา
- [ ] Unit Tests & Integration Tests
- [ ] API Documentation (Swagger/OpenAPI)
- [ ] Rate Limiting
- [ ] Advanced Input Validation
- [ ] Logging System (Winston/Pino)

### 💡 แผนอนาคต
- [ ] Real-time Updates (WebSocket)
- [ ] File Attachments
- [ ] Comments System
- [ ] Team Collaboration
- [ ] Activity Logs
- [ ] Email Notifications

---

## 🤝 การมีส่วนร่วม

เรายินดีรับ Contribution จากทุกคน!

1. Fork โปรเจกต์
2. สร้าง Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit การเปลี่ยนแปลง (`git commit -m 'Add some AmazingFeature'`)
4. Push ไปยัง Branch (`git push origin feature/AmazingFeature`)
5. เปิด Pull Request

---

## 👨‍💻 ผู้พัฒนา

**Phraew Chuthamat**

- 🌐 GitHub: [@phraewchuthamat](https://github.com/phraewchuthamat)
- 📧 Email: phraewchuthamat@example.com
- 💼 LinkedIn: [Phraew Chuthamat](https://linkedin.com/in/phraewchuthamat)

---

## 📄 License

This project is licensed under the ISC License.

---

## 🙏 ขอบคุณ

- [Prisma](https://www.prisma.io/) - สำหรับ ORM ที่ยอดเยี่ยม
- [Express.js](https://expressjs.com/) - Framework ที่เรียบง่ายแต่ทรงพลัง
- [Docker](https://www.docker.com/) - ทำให้ deployment ง่ายขึ้นมาก

---

<div align="center">

**⭐ ถ้าชอบโปรเจกต์นี้ อย่าลืม Star ให้ด้วยนะครับ! ⭐**

Made with ❤️ by Phraew Chuthamat

</div>
