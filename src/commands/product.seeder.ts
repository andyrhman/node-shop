require('dotenv').config();
import { Category } from "../models/category.schema";
import { fakerID_ID as faker } from "@faker-js/faker";
import { randomInt } from "crypto";
import { Product } from "../models/product.schema";
import { ProductImages } from "../models/product-images.schema";
import { ProductVariations } from "../models/product-variation.schema";
import mongoose from "mongoose";
import slugify from "slugify";
import logger from "../config/logger.config";

mongoose.connect(`mongodb+srv://tataran:${process.env.MONGO_PASSWORD}@nodeadmin.yjvkzpx.mongodb.net/node_shop?retryWrites=true&w=majority`).then(async () => {
    const categories = await Category.find()

    for (let i = 0; i < 30; i++) {
        const title = faker.commerce.productName();
        const slug = slugify(title, {
            lower: true,
            strict: true,
            trim: true
        });
        // * For the product.
        const product = await Product.create({
            title: title,
            slug: slug,
            description: faker.commerce.productDescription(),
            image: faker.image.urlLoremFlickr({ width: 200, height: 200, category: 'food' }),
            price: parseInt(faker.commerce.price({ min: 100000, max: 5000000, dec: 0 })),
            cart: [],
            category_id: categories[i % categories.length]._id
        });
        // * For the product images
        for (let i = 0; i < randomInt(1, 5); i++) {
            await ProductImages.create({
                productId: product._id,
                image: faker.image.urlLoremFlickr({ width: 200, height: 200, category: 'food' }),
            })
        }
        // * For the variants
        for (let i = 0; i < randomInt(1, 6); i++) {
            await ProductVariations.create({
                name: faker.commerce.productMaterial(),
                product_id: product._id,
                cart: []
            })
        }
    }

    logger.info("🌱 Seeding has been completed")
    process.exit(0);
}).catch((err) => {
    logger.error(err);
})