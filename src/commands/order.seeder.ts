require('dotenv').config();
import { randomInt } from "crypto";
import { User } from "../models/user.schema";
import { Product } from "../models/product.schema";
import { Order } from "../models/order.schema";
import { OrderItem } from "../models/order-items.schema";
import { ProductVariations } from "../models/product-variation.schema";
import mongoose from "mongoose";
import logger from "../config/logger.config";

mongoose.connect(`mongodb+srv://tataran:${process.env.MONGO_PASSWORD}@nodeadmin.yjvkzpx.mongodb.net/node_shop?retryWrites=true&w=majority`).then(async () => {

    // * Fetch all users from the database
    const users = await User.find({});
    const product = await Product.find({});
    const variants = await ProductVariations.find();

    for (let i = 0; i < 30; i++) {
        const order = await Order.create({
            user_id: users[i].id,
            name: users[i].fullName,
            email: users[i].email,
            completed: true
        });

        for (let j = 0; j < randomInt(1, 5); j++) {
            const orderItem = await OrderItem.create({
                order_id: order,
                product_id: product[i]._id,
                variant_id: variants[i]._id,
                product_title: product[i].title,
                price: product[i].price,
                quantity: randomInt(1, 5),
            });
            order.order_items.push(orderItem)
        }

        await order.save();
    }

    logger.info("🌱 Seeding has been completed")
    process.exit(0);
}).catch((err) => {
    logger.error(err);
})