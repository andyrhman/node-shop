import { randomInt } from "crypto";
import { Cart } from "../entity/cart.entity";
import { Order } from "../entity/order.entity";
import { Product } from "../entity/product.entity";
import { User } from "../entity/user.entity";
import seederSource from "../config/seeder.config";
import logger from "../config/logger.config";

seederSource.initialize().then(async () => {

    const users = await seederSource.getRepository(User).find({});
    const product = await seederSource.getRepository(Product).find({});
    const orders = await seederSource.getRepository(Order).find({})

    for (let i = 0; i < 30; i++) {
        await seederSource.getRepository(Cart).save({
            product_title: product[i].title,
            quantity: randomInt(1,4),
            product_id: product[i].id,
            user_id: users[i].id,
            order_id: orders[i].id,
            price: product[i].price,
            completed: true
        });
    }

    logger.info("🌱 Seeding has been completed")
    process.exit(0);
}).catch((err) => {
    logger.error(err);
})