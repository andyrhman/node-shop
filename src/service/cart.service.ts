// import myDataSource from "../config/db.config";
// import { Cart } from "../entity/cart.entity";
// import { AbstractService } from "./abstract.service";

// export class CartService extends AbstractService<Cart> {
//   constructor() {
//     super(myDataSource.getRepository(Cart));
//   }
//   async deleteUserCart(user_id: string, cart_id: string): Promise<any> {
//     return this.repository.delete({ user_id: user_id, id: cart_id });
//   }

//   async findCartItemByProductAndVariant(
//     productId: string,
//     variantId: string,
//     userId: string
//   ) {
//     return this.repository
//       .createQueryBuilder("cart")
//       .where("cart.product_id = :productId", { productId })
//       .andWhere("cart.variant_id = :variantId", { variantId })
//       .andWhere("cart.user_id = :userId", { userId })
//       .andWhere("cart.completed = :completed", { completed: false })
//       .getOne();
//   }

//   async findUserCart(options, relations = []) {
//     const cartItems = await this.repository.find({ where: options, relations });
//     // map through the cart items and calculate the total price for each item
//     const cartWithTotalPrices = cartItems.map((item) => ({
//       ...item,
//       total_price: item.price * item.quantity,
//     }));
//     return cartWithTotalPrices;
//   }

//   async chart(): Promise<any[]> {
//     const query = `
//         SELECT
//         TO_CHAR(c.created_at, 'YYYY-MM-DD') as date,
//         REPLACE(TO_CHAR(TRUNC(sum(c.quantity)), 'FM999G999G999'), ',', '') as sum
//         FROM carts c
//         GROUP BY TO_CHAR(c.created_at, 'YYYY-MM-DD')
//         ORDER BY TO_CHAR(c.created_at, 'YYYY-MM-DD') ASC;      
//     `;

//     const result = await this.repository.query(query);
//     return result;
//   }

//   async totalPriceAndCount(options, relations = []) {
//     const cartItems = await this.repository.find({ where: options, relations });
//     let totalItems = 0;
//     let totalPrice = 0;
//     cartItems.forEach((item) => {
//       if (item.completed === false) {
//         totalItems += item.quantity;
//         totalPrice += item.price * item.quantity;
//       }
//     });
//     return {
//       total: totalItems,
//       totalPrice,
//     };
//   }
// }
