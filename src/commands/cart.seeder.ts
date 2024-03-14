require('dotenv').config();
import { randomInt } from "crypto";
import { Cart } from "../models/cart.schema";
import { Order } from "../models/order.schema";
import { Product } from "../models/product.schema";
import { User } from "../models/user.schema";
import mongoose from 'mongoose'
import logger from "../config/logger.config";
import { ProductVariations } from "../models/product-variation.schema";

mongoose.connect(`mongodb+srv://tataran:${process.env.MONGO_PASSWORD}@nodeadmin.yjvkzpx.mongodb.net/node_shop?retryWrites=true&w=majority`).then(async () => {

    const users = User.find();
    const product = Product.find();
    const variants = ProductVariations.find();
    const orders = Order.find();

    for (let i = 0; i < 30; i++) {
        const c = await Cart.create({
            product_title: product[i].title,
            quantity: randomInt(1,4),
            product_id: product[i]._id,
            variant_id: variants[i]._id,
            user_id: users[i]._id,
            order_id: orders[i]._id,
            price: product[i].price,
            completed: true
        });
        
        for (let j = 0; j < randomInt(1, 5); j++) {
            await Product.findByIdAndUpdate(product[i]._id, { $push: { cart: c[j]._id } });
            await ProductVariations.findByIdAndUpdate(variants[i]._id, { $push: { cart: c[j]._id } });
        }

    }

    logger.info("🌱 Seeding has been completed")
    process.exit(0);
}).catch((err) => {
    logger.error(err);
})