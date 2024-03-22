import myDataSource from "../config/db.config";
import { Order, OrderDocument } from "../models/order.schema";
import { AbstractService } from "./abstract.service";

export class OrderService extends AbstractService<OrderDocument> {
  constructor() {
    super(Order);
  }
  
  async chart(): Promise<any[]> {
    const results = await Order.aggregate([
      {
        $match: {
          completed: true
        }
      },
      {
        $lookup: {
          from: 'order_items',
          localField: '_id',
          foreignField: 'order_id',
          as: 'items'
        }
      },
      {
        $unwind: '$items'
      },
      {
        $group: {
          _id: {
            date: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$created_at'
              }
            }
          },
          sum: {
            $sum: {
              $multiply: ['$items.price', '$items.quantity']
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          date: '$_id.date',
          sum: {
            $toString: '$sum'
          }
        }
      },
      {
        $sort: {
          date: 1
        }
      }
    ]).exec();

    // Format the result to match the SQL output with Indonesian Rupiah currency format
    return results.map((result) => ({
      ...result,
      sum: `${(parseInt(result.sum) / 100).toLocaleString("id-ID")}`,
    }));
  }
}
