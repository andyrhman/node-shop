require('dotenv').config();
import { fakerID_ID as faker } from "@faker-js/faker";
import { User } from "../models/user.schema";
import mongoose from "mongoose";
import logger from '../config/logger.config';
import * as argon2 from 'argon2';
import { Cart, CartDocument } from "../models/cart.schema";

mongoose.connect(`mongodb+srv://tataran:${process.env.MONGO_PASSWORD}@nodeadmin.yjvkzpx.mongodb.net/node_shop?retryWrites=true&w=majority`).then(async () => {

    const password = await argon2.hash("123123");
    
    // * Creating 30 users by using for loop.
    // ? You could also use map here's the link https://www.phind.com/search?cache=fp0nc4vds36gdwixhj9mhtmc
    for (let i = 0; i < 30; i++) {
        const user = new User();

        user.fullName = faker.person.fullName();
        user.username = faker.internet.userName().toLowerCase();
        user.email = faker.internet.email().toLowerCase();
        user.password = password;
        user.is_verified = true;
        user.cart = [];
        user.orders = [];
        user.verify = [];
        user.review = [];

        // const carts = await Cart.find({user_id: user});
        // user.cart = carts;

        await user.save();
    }

    logger.info("🌱 Seeding has been completed")
    process.exit(0);
}).catch((err) => {
    logger.error(err);
});

// ! YOU NEED TO RUN THIS SEEDER INSIDE DOCKER CONTAINER OR IT WON'T WORK!
// * docker exec -it <container id use (docker ps) to check> bash
// * modify package.json script setting
// * npm run seed:ambassadors 