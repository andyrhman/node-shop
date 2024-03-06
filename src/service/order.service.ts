import myDataSource from "../config/db.config";
import { Order, OrderDocument } from "../models/order.schema";
import { AbstractService } from "./abstract.service";

export class OrderService extends AbstractService<OrderDocument> {
  constructor() {
    super(Order);
  }

  async findCompletedOrdersByUser(userId: string) {
    return this.model.find({ user_id: userId, completed: true });
  }

  async chart(): Promise<any[]> {
    const results = await Order.aggregate([
      {
        $match: {
          completed: true,
        },
      },
      {
        $unwind: "$order_items",
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
            },
          },
          sum: {
            $sum: {
              $multiply: ["$order_items.price", "$order_items.quantity"],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          date: "$_id",
          sum: {
            $toString: "$sum",
          },
        },
      },
      {
        $sort: {
          date: 1,
        },
      },
    ]);

    // Format the result to match the SQL output
    return results.map((item) => ({
      date: item.date,
      sum: item.sum.replace(/,/g, ""), // Remove commas as per the SQL REPLACE function
    }));
  }
}
