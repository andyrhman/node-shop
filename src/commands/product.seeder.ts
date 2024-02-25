import { Category } from "../entity/category.entity";
import { fakerID_ID as faker } from "@faker-js/faker";
import { randomInt } from "crypto";
import slugify from "slugify";
import seederSource from "../config/seeder.config";
import logger from "../config/logger.config";
import { Product } from "../entity/product.entity";
import { ProductImages } from "../entity/product-images.entity";
import { ProductVariation } from "../entity/product-variation.entity";

seederSource.initialize().then(async () => {
    const categories = await seederSource.getRepository(Category).find({})

    for (let i = 0; i < 30; i++) {
        const title = faker.commerce.productName();
        const slug = slugify(title, {
            lower: true,
            strict: true,
            trim: true
        });
        // * For the product.
        const product = await seederSource.getRepository(Product).save({
            title: title,
            slug: slug,
            description: faker.commerce.productDescription(),
            image: faker.image.urlLoremFlickr({ width: 200, height: 200, category: 'food' }),
            price: parseInt(faker.commerce.price({ min: 100000, max: 5000000, dec: 0 })),
            category_id: categories[i % categories.length].id
        });
        // * For the product images
        for (let i = 0; i < randomInt(1, 5); i++) {
            await seederSource.getRepository(ProductImages).save({
                productId: product.id,
                image: faker.image.urlLoremFlickr({ width: 200, height: 200, category: 'food' }),
            })
        }
        // * For the variants
        for (let i = 0; i < randomInt(1, 6); i++) {
            await seederSource.getRepository(ProductVariation).save({
                name: faker.commerce.productMaterial(),
                product_id: product.id,
            })
        }
    }

    logger.info("🌱 Seeding has been completed")
    process.exit(0);
}).catch((err) => {
    logger.error(err);
})