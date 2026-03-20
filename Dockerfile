FROM node:18-alpine

WORKDIR /app

# คัดลอก package.json เพื่อติดตั้ง dependencies
COPY package*.json ./
RUN npm install

# คัดลอกโค้ดทั้งหมด
COPY . .

# สร้าง Prisma Client
RUN npx prisma generate

# Build โค้ด TypeScript
RUN npm run build

EXPOSE 3000

# เมื่อเริ่ม Container ให้ทำ Prisma db push เพื่อให้ Database อัปเดตตาราง
# แล้วค่อยรันแอปพลิเคชัน
CMD npx prisma db push && npm run start
