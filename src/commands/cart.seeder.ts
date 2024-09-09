import { Length } from 'class-validator';
import { fakerID_ID as faker } from "@faker-js/faker";
import { randomInt } from "crypto";
import { PrismaClient } from '@prisma/client';
import slugify from "slugify";
import myPrisma from "../config/db.config";

const prisma = new PrismaClient();

async function main() {
    const users = await myPrisma.user.findMany();
    const product = await myPrisma.product.findMany();
    const orders = await myPrisma.order.findMany();
    
    for (let i = 0; i < 30; i++) {
        const variant = await myPrisma.productVariation.findMany({ where: { product_id: product[i % product.length].id } });
        await myPrisma.cart.create({
            data: {
                product_title: product[i % product.length].title,
                quantity: randomInt(1, 4),
                product: { connect: { id: product[i % product.length].id } },
                variant: { connect: { id: variant[i % variant.length].id } },
                user: { connect: { id: users[i % users.length].id } },
                order: orders.length > 0 ? { connect: { id: orders[i % orders.length].id } } : undefined,
                price: parseInt(product[i].price, 10),
                completed: true
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