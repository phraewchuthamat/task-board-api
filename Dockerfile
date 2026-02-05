# File: task-board-api/Dockerfile

# 1. ใช้ Node Version ล่าสุด
FROM node:latest

# 2. ตั้ง Working Directory
WORKDIR /app

# 3. Copy ไฟล์ package มาก่อนเพื่อ Install (ใช้ Cache ได้ถ้าไฟล์ไม่เปลี่ยน)
COPY package*.json ./
COPY prisma ./prisma/

# 4. Install Dependencies
RUN npm install

# 5. Copy Code ทั้งหมดลงไป
COPY . .

# 6. สร้าง Prisma Client
RUN npx prisma generate

# 7. Build TypeScript เป็น JavaScript (เพื่อประสิทธิภาพที่ดี)
# ตรวจสอบว่าใน package.json มี script "build": "tsc" หรือไม่ ถ้าไม่มีให้ใช้ npx tsc แทน
RUN npm run build 

# 8. เปิด Port 3000 (Internal Container Port)
EXPOSE 3000

# 9. คำสั่งรัน Server (รันจากไฟล์ที่ Build แล้ว)
CMD ["node", "dist/app.js"]