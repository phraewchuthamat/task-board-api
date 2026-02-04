// src/test-db.ts
import prisma from './prisma'

async function main() {
    // ลองสร้าง User จำลอง
    const user = await prisma.user.create({
        data: {
            username: 'testuser',
            password: 'password123', // เดี๋ยวขั้นต่อไปเราค่อยทำ Hash
        },
    })
    console.log('Created User:', user)

    // ลองดึงข้อมูลมาดู
    const allUsers = await prisma.user.findMany()
    console.log('All Users:', allUsers)
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect())