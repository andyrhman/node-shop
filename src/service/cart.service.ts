import { Cart, CartDocument } from "../models/cart.schema";
import { AbstractService } from "./abstract.service";

export class CartService extends AbstractService<CartDocument> {
  constructor() {
    super(Cart);
  }
  async deleteUserCart(user_id: string, cart_id: string): Promise<any> {
    return this.model.findOneAndDelete({ user_id: user_id, id: cart_id });
  }

  async findCartItemByProductAndVariant(
    productId: string,
    variantId: string,
    userId: string
  ) {
    // Use Mongoose's `findOne` method to find a single document that matches the criteria
    const cartItem = await Cart.findOne({
      productId: productId,
      variantId: variantId,
      userId: userId,
      completed: false,
    });

    return cartItem;
  }

  // ? Ask chat gpt this, what's the difference in using findOne method
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

  async findUserCart(options: any) {
    const cartItems = await this.model
      .find(options)
      .populate("variant", "product", "order");
    // map through the cart items and calculate the total price for each item
    const cartWithTotalPrices = cartItems.map((item) => ({
      ...item,
      total_price: item.price * item.quantity,
    }));
    return cartWithTotalPrices;
  }

  async chart(): Promise<any[]> {
    const result = await Cart.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          sum: { $sum: "$quantity" },
        },
      },
      {
        $project: {
          date: "$_id",
          sum: { $toString: "$sum" },
        },
      },
      {
        $sort: {
          date: 1,
        },
      },
    ]);

    // Format the result to match the SQL output
    return result.map((item) => ({
      date: item.date,
      sum: item.sum.replace(/,/g, ""), // Remove commas as per the SQL REPLACE function
    }));
  }

  async totalPriceAndCount(options: any) {
    const cartItems = await this.model.find(options);
    let totalItems = 0;
    let totalPrice = 0;
    cartItems.forEach((item) => {
      if (item.completed === false) {
        totalItems += item.quantity;
        totalPrice += item.price * item.quantity;
      }
    });
    return {
      total: totalItems,
      totalPrice,
    };
  }
}