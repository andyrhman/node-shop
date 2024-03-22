import { User, UserDocument } from "../models/user.schema";
import { AbstractService } from "./abstract.service";

export class UserService extends AbstractService<UserDocument> {
  constructor() {
    super(User);
  }
  async find(options: any) {
    return this.model.find(options).sort({ createdAt: -1 }).populate('orders');
  }
  async chart(): Promise<any[]> {
    const result = await User.aggregate([
        {
          $project: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$created_at" } },
            _id: 0
          }
        },
        {
          $group: {
            _id: "$date",
            count: { $sum: 1 }
          }
        },
        {
          $sort: {
            _id: 1
          }
        }
     ]);
    
     // Format the result to match the SQL output
     return result.map(item => ({
        date: item._id,
        count: item.count.toString()
     }));
  }
}
