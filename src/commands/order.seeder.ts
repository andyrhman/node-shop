// import { randomInt } from "crypto";
// import { User } from "../entity/user.entity";
// import { Product } from "../entity/product.entity";
// import { Order } from "../entity/order.entity";
// import { OrderItem } from "../entity/order-items.entity";
// import seederSource from "../config/seeder.config";
// import logger from "../config/logger.config";

// seederSource.initialize().then(async () => {

//     // * Fetch all users from the database
//     const users = await seederSource.getRepository(User).find({});
//     const product = await seederSource.getRepository(Product).find({});

//     for (let i = 0; i < 30; i++) {
//         const order = await seederSource.getRepository(Order).save({
//             user_id: users[i].id,
//             name: users[i].fullName,
//             email: users[i].email,
//             completed: true
//         });

//         for (let j = 0; j < randomInt(1, 5); j++) {
//             await seederSource.getRepository(OrderItem).save({
//                 order: order,
//                 product_id: product[i].id,
//                 product_title: product[i].title,
//                 price: product[i].price,
//                 quantity: randomInt(1, 5),
//             });
//         }
//     }

//     logger.info("🌱 Seeding has been completed")
//     process.exit(0);
// }).catch((err) => {
//     logger.error(err);
// })