import { fakerID_ID as faker } from "@faker-js/faker";
import { randomInt } from "crypto";
import { PrismaClient } from '@prisma/client';
import slugify from "slugify";
import myPrisma from "../config/db.config";

const prisma = new PrismaClient();

async function main() {
    const categories = await myPrisma.category.findMany();

    for (let i = 0; i < 30; i++) {
        const title = faker.commerce.productName();
        const slug = slugify(title, {
            lower: true,
            strict: true,
            trim: true
        });
        // * For the product.
        const product = await myPrisma.product.create({
            data: {
                title: title,
                slug: slug,
                description: faker.commerce.productDescription(),
                image: faker.image.urlLoremFlickr({ width: 200, height: 200, category: 'food' }),
                price: faker.commerce.price({ min: 100000, max: 5000000, dec: 0 }),
                category_id: categories[i % categories.length].id
            }
        });
        // * For the product images
        for (let i = 0; i < randomInt(1, 5); i++) {
            await myPrisma.productImages.create({
                data: {
                    product_id: product.id,
                    image: faker.image.urlLoremFlickr({ width: 200, height: 200, category: 'food' })
                }
            });
        }
        // * For the variants
        for (let i = 0; i < randomInt(1, 6); i++) {
            await myPrisma.productVariation.create({
                data: {
                    name: faker.commerce.productMaterial(),
                    product_id: product.id
                }
            });
        }
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