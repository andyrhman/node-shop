require('dotenv').config();
import { fakerID_ID as faker } from "@faker-js/faker";
import { randomInt } from "crypto";
import { User } from "../models/user.schema";
import { Product } from "../models/product.schema";
import { ProductVariations } from "../models/product-variation.schema";
import { Review } from "../models/review.schema";
import { Order } from "../models/order.schema";
import mongoose from "mongoose";
import logger from "../config/logger.config";

mongoose.connect(`mongodb+srv://tataran:${process.env.MONGO_PASSWORD}@nodeadmin.yjvkzpx.mongodb.net/node_shop?retryWrites=true&w=majority`).then(async () => {

    const users = await User.find({});
    const products = await Product.find({});
    const orders = await Order.find();
    const variants = await ProductVariations.find({});

    for (let i = 0; i < 100; i++) {
        await Review.create({
            star: randomInt(1, 6),
            comment: faker.word.words(16),
            image: faker.image.urlLoremFlickr({ width: 200, height: 200, category: 'food' }),
            user_id: users[i % users.length]._id,
            product_id: products[i % products.length]._id,
            variant_id: variants[i % variants.length]._id,
            order_id: orders[i % orders.length]._id
        });
    }

    logger.info("🌱 Seeding has been completed")
    process.exit(0);
}).catch((err) => {
    logger.error(err);
});