import { PrismaClient } from '@prisma/client';
import myPrisma from "../config/db.config";
import * as argon2 from 'argon2';

const prisma = new PrismaClient();
async function main() {
    const password = await argon2.hash("123123");

    let addCount = 1;
    for (let i = 0; i < 3; i++) {
        // Generate a random boolean value for is_user
        const isUser = Math.random() >= 0.5;

        await myPrisma.user.create({
            data: {
                fullName: `tes${addCount}`,
                username: `tes${addCount}`,
                email: `tes${addCount}@mail.com`,
                password,
                is_verified: true,
                is_user: isUser
            }
        });
        addCount++;
    }
    console.info("Seeding has been completed");
}
main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
