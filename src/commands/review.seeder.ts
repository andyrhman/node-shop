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
import { OrderItem } from "../models/order-items.schema";

mongoose.connect(`mongodb+srv://tataran:${process.env.MONGO_PASSWORD}@nodeadmin.yjvkzpx.mongodb.net/node_shop?retryWrites=true&w=majority`).then(async () => {

    const users = await User.find({});
    const products = await Product.find({});

    const variants = await ProductVariations.find({});

    for (let i = 0; i < 100; i++) {
        const review = new Review();

        review.star = randomInt(1, 6);
        review.comment = faker.word.words(16);
        review.image = faker.image.urlLoremFlickr({ width: 200, height: 200, category: 'food' });

        const orders = await Order.find().populate('order_items');
        const orderItems = await OrderItem.find({order_id: orders});

        review.user_id = orders[i % orders.length].user_id;
        review.product_id = orderItems[i % products.length].product_id;
        review.variant_id = orderItems[i % variants.length].variant_id;
        review.order_id = orderItems[i % orders.length].order_id;

        await User.findByIdAndUpdate(users[i % users.length].id, { $push: { review: review._id } });
        await review.save();
    }

    logger.info("🌱 Seeding has been completed")
    process.exit(0);
}).catch((err) => {
    logger.error(err);
});