import { fakerID_ID as faker } from "@faker-js/faker";
import { PrismaClient } from '@prisma/client';
import myPrisma from "../config/db.config";
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {

    const password = await argon2.hash("123123");

    // * Creating 30 users by using for loop.
    // ? You could also use map here's the link https://www.phind.com/search?cache=fp0nc4vds36gdwixhj9mhtmc
    for (let i = 0; i < 30; i++) {
        await myPrisma.user.create({
            data: {
                fullName: faker.person.fullName(),
                username: faker.internet.userName().toLowerCase(),
                email: faker.internet.email().toLowerCase(),
                password,
                is_verified: true
            }
        });
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

// ! YOU NEED TO RUN THIS SEEDER INSIDE DOCKER CONTAINER OR IT WON'T WORK!
// * docker exec -it <container id use (docker ps) to check> bash
// * modify package.json script setting
// * npm run seed:ambassadors 