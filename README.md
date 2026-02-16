#  Task Board API

> **ระบบจัดการงานแบบ Kanban Board ที่ยืดหยุ่น ปลอดภัย และพร้อมใช้งานจริง**

<p align="left">
  <a href="https://www.typescriptlang.org/" target="_blank">
    <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  </a>
  <a href="https://nodejs.org/" target="_blank">
    <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  </a>
  <a href="https://expressjs.com/" target="_blank">
    <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
  </a>
  <a href="https://www.prisma.io/" target="_blank">
    <img src="https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma" />
  </a>
  <a href="https://www.postgresql.org/" target="_blank">
    <img src="https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  </a>
  <a href="https://render.com/" target="_blank">
    <img src="https://img.shields.io/badge/Render-000000?style=for-the-badge&logo=render&logoColor=white" alt="Render" />
  </a>
</p>

---

##  ปัญหาที่พบ

### ความท้าทายในการจัดการงาน

ในยุคที่ทีมงานต้องทำงานร่วมกันแบบ Remote และต้องการความยืดหยุ่นในการจัดการงาน เราพบปัญหาหลักๆ ดังนี้:

1. **ขาดความยืดหยุ่น** 
   - ระบบจัดการงานส่วนใหญ่มีโครงสร้างคอลัมน์ที่ตายตัว (To Do, In Progress, Done)
   - ไม่สามารถปรับเปลี่ยนขั้นตอนการทำงานให้เหมาะกับทีมแต่ละทีมได้

2. **ความปลอดภัยไม่เพียงพอ** 
   - ข้อมูลของแต่ละคนอาจถูกเข้าถึงโดยผู้ที่ไม่เกี่ยวข้อง
   - ไม่มีระบบยืนยันตัวตนที่แข็งแกร่ง

3. **ยากต่อการ Deploy** 
   - ต้องติดตั้งหลายอย่าง ซับซ้อน
   - การจัดการ Database ใน Production ทำได้ยาก

4. **ไม่เหมาะกับการพัฒนาต่อยอด** 
   - โค้ดไม่เป็นระเบียบ มี Code Duplication
   - ขาดการจัดการ Environment Variables ที่ดี

---

##  วิธีแก้ปัญหา

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
- ✅ **JWT Authentication** ที่แข็งแกร่ง
- ✅ **User Authorization** - แต่ละคนเห็นเฉพาะข้อมูลของตัวเอง
- ✅ **Environment Variables** - ไม่มี Secrets hardcoded ในโค้ด
- ✅ **CORS Configuration** - ควบคุมการเข้าถึงจาก Frontend (รองรับ Vercel)

```typescript
// ทุก Request ต้องผ่านการยืนยันตัวตน
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

// ระบบตรวจสอบว่าผู้ใช้มีสิทธิ์เข้าถึงข้อมูลหรือไม่
if (task.userId !== req.user.userId) {
  return res.status(403).json({ message: 'Forbidden' })
}
```

#### 3. **พร้อม Deploy ทันที** (Render-Ready)

เราเตรียม Infrastructure as Code (`render.yaml`) ไว้ให้แล้ว เพียงเชื่อมต่อกับ Render ก็พร้อมใช้งานทันที:

- 🚀 **Auto Deploy**: เมื่อ Push code ขึ้น Git
- 🗄️ **Managed Database**: สร้าง PostgreSQL ให้อัตโนมัติ
- � **Auto Secrets**: สร้าง JWT Secret ให้เอง

**ผลลัพธ์:** จาก "ติดตั้งยาก" เป็น "คลิกเดียว Deploy"

#### 4. **โค้ดคุณภาพสูง** (Clean Architecture)

เราปรับปรุงโค้ดให้:
-  **Modular Design** - แยก Controllers, Routes, Middlewares, Utilities
-  **No Code Duplication** - ใช้ Shared Error Handler
-  **Type Safety** - TypeScript ทั้งโปรเจกต์ (Strict Mode + NodeNext Modules)
-  **Clear Naming** - ตัวแปรและฟังก์ชันมีชื่อที่สื่อความหมาย

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

##  เทคโนโลยีที่ใช้

เราเลือกใช้เทคโนโลยีที่ดีที่สุดและเหมาะสมที่สุดสำหรับแต่ละส่วน:

| เทคโนโลยี | เหตุผลที่เลือก | ประโยชน์ |
|-----------|----------------|----------|
| **TypeScript** | Type Safety, Better Developer Experience | ลดบั๊ก, เขียนโค้ดได้เร็วขึ้น |
| **Express.js** | Lightweight, Flexible, มี Community ใหญ่ | พัฒนาได้รวดเร็ว, มี Library เยอะ |
| **Prisma ORM** | Type-Safe Database Access, Auto Migration | ไม่ต้องเขียน SQL เอง, ปลอดภัย |
| **PostgreSQL** | Reliable, Advanced Features | มาตรฐานอุตสาหกรรม, Render รองรับฟรี |
| **JWT** | Stateless Authentication | Scale ได้ง่าย, ไม่ต้องเก็บ Session |
| **Render** | Cloud Platform (PaaS) | Deploy ง่าย, มี Free Tier |

---

## ✨ ผลลัพธ์: ได้อะไรบ้าง?

### ระบบที่ใช้งานได้จริง พร้อมทุกอย่าง

#### 📊 ฟีเจอร์หลัก

✅ **ระบบ Authentication ที่สมบูรณ์**
- สมัครสมาชิก (Register)
- เข้าสู่ระบบ (Login)
- ลืมรหัสผ่าน / รีเซ็ตรหัสผ่าน (Forgot/Reset Password)
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
- CORS ที่ปรับแต่งได้

####  API Endpoints ที่พร้อมใช้งาน

```http
# Authentication
POST   /auth/register          # สมัครสมาชิก
POST   /auth/login             # เข้าสู่ระบบ
POST   /auth/forgot-password   # ขอ Token รีเซรทรหัสผ่าน
POST   /auth/reset-password    # ตั้งรหัสผ่านใหม่
GET    /auth/profile           # ดูข้อมูลส่วนตัว
PUT    /auth/profile           # อัปเดตข้อมูลส่วนตัว

# Columns (ต้องมี Token)
GET    /columns                # ดึงข้อมูล Columns (พร้อม Tasks)
POST   /columns                # สร้าง Column ใหม่
PATCH  /columns/:id            # แก้ไข Column
DELETE /columns/:id            # ลบ Column

# Tasks (ต้องมี Token)
GET    /tasks                  # ดึงข้อมูล Tasks
POST   /tasks                  # สร้าง Task ใหม่
PATCH  /tasks/:id              # แก้ไข Task (ย้าย Column ได้)
DELETE /tasks/:id              # ลบ Task
```

---

##  เริ่มต้นใช้งาน

### วิธีที่ 1: Deploy บน Render.com (แนะนำ)

1.  **Fork/Clone** โปรเจกต์นี้ไปที่ GitHub/GitLab ของคุณ
2.  สมัครสมาชิก [Render.com](https://render.com)
3.  กด **New +** -> **Blueprint**
4.  เชื่อมต่อกับ Repository ของคุณ
5.  Render จะอ่านไฟล์ `render.yaml` และตั้งค่าทุกอย่างให้อัตโนมัติ (Web Service + PostgreSQL)
6.  **เสร็จสิ้น!** 🎉

### วิธีที่ 2: Local Development

```bash
# 1. ติดตั้ง Dependencies
npm install

# 2. ตั้งค่า Database (PostgreSQL)
# ต้องมี PostgreSQL รันอยู่ (ติดตั้งเอง หรือใช้ Docker)
# docker run --name postgres-taskboard -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres:15

# 3. สร้างไฟล์ .env (Copy จาก .env.example)
cp .env.example .env
# แก้ไข DATABASE_URL ให้ตรงกับเครื่องของคุณ

# 4. Sync Database Schema
npx prisma db push

# 5. รัน Development Server
npm run dev
# Server จะรันที่ http://localhost:4000
```

---

## 📖 ตัวอย่างการใช้งาน

### 1. ลืมรหัสผ่าน (New Feature)

```bash
# ขอ Token รีเซ็ต
curl -X POST http://localhost:4000/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{ "username": "john" }'

# ตั้งรหัสใหม่
curl -X POST http://localhost:4000/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "YOUR_RESET_TOKEN",
    "newPassword": "newsecurepassword",
    "confirmPassword": "newsecurepassword"
  }'
```

### 2. สร้าง Workflow ของคุณเอง

```bash
# สร้าง Column แรก
curl -X POST http://localhost:4000/columns \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": " To Do",
    "color": "#FF6B6B"
  }'
```

---

##  โครงสร้างฐานข้อมูล

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

##  คำสั่งที่ใช้บ่อย

### Prisma Commands

```bash
# Deploy Schema changes to DB (สำหรับการพัฒนา)
npx prisma db push

# Generate Prisma Client (เมื่อเปลี่ยน Schema)
npm run prisma:generate

# เปิด Prisma Studio (GUI จัดการข้อมูล)
npm run prisma:studio
```

### Development Commands

```bash
# รัน Development Server (Native ESM Support)
npm run dev

# Build Production
npm run build

# รัน Production
npm start
```

---

## License

This project is licensed under the ISC License.

Created by [phraewchuthamat](https://github.com/phraewchuthamat)




