require('dotenv').config();
import { randomInt } from "crypto";
import { Cart } from "../models/cart.schema";
import { Product } from "../models/product.schema";
import { User } from "../models/user.schema";
import mongoose from 'mongoose'
import logger from "../config/logger.config";
import { ProductVariations } from "../models/product-variation.schema";

mongoose.connect(`mongodb+srv://tataran:${process.env.MONGO_PASSWORD}@nodeadmin.yjvkzpx.mongodb.net/node_shop?retryWrites=true&w=majority`).then(async () => {

    const users = await User.find();
    const product = await Product.find();
    const variants = await ProductVariations.find();
    for (let i = 0; i < 100; i++) {
        const c = await Cart.create({
            product_title: product[i % product.length].title,
            quantity: randomInt(1,4),
            product_id: product[i % product.length]._id,
            variant_id: variants[i % variants.length]._id,
            user_id: users[i % users.length]._id,
            price: product[i % product.length].price,
            completed: true
        });

        for (let j = 0; j < randomInt(1, 5); j++) {
            await Product.findByIdAndUpdate(product[i % product.length].id, { $push: { cart: c._id } });
            await ProductVariations.findByIdAndUpdate(variants[i % variants.length].id, { $push: { cart: c._id } });
            await User.findByIdAndUpdate(users[i % users.length].id, { $push: { cart: c._id } });
        }
    }

    logger.info("🌱 Seeding has been completed")
    process.exit(0);
}).catch((err) => {
    logger.error(err);
})