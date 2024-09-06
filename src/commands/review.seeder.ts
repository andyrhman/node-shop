// import { fakerID_ID as faker } from "@faker-js/faker";
// import { randomInt } from "crypto";
// import { User } from "../entity/user.entity";
// import { Product } from "../entity/product.entity";
// import { ProductVariation } from "../entity/product-variation.entity";
// import { Review } from "../entity/review.entity";
// import seederSource from "../config/seeder.config";
// import logger from "../config/logger.config";

// seederSource.initialize().then(async () => {

//     const users = await seederSource.getRepository(User).find({});
//     const products = await seederSource.getRepository(Product).find({});
//     const variants = await seederSource.getRepository(ProductVariation).find({});

//     for (let i = 0; i < 100; i++) {
//         await seederSource.getRepository(Review).save({
//             star: randomInt(1, 6),
//             comment: faker.word.words(16),
//             image: faker.image.urlLoremFlickr({ width: 200, height: 200, category: 'food' }),
//             user_id: users[i % users.length].id,
//             product_id: products[i % products.length].id,
//             variant_id: variants[i % variants.length].id
//         });
//     }

//     logger.info("🌱 Seeding has been completed")
//     process.exit(0);
// }).catch((err) => {
//     logger.error(err);
// });