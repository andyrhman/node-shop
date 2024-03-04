// import myDataSource from "../config/db.config";
// import { Order } from "../entity/order.entity";
// import { AbstractService } from "./abstract.service";

// export class OrderService extends AbstractService<Order> {
//   constructor() {
//     super(myDataSource.getRepository(Order));
//   }
  
//   async findCompletedOrdersByUser(userId: string) {
//     return this.repository.find({
//       where: { user_id: userId, completed: true },
//     });
//   }
  
//   async chart(): Promise<any[]> {
//     const query = `
//         SELECT
//         TO_CHAR(o.created_at, 'YYYY-MM-DD') as date,
//         REPLACE(TO_CHAR(TRUNC(sum(i.price * i.quantity)), 'FM999G999G999'), ',', '') as sum
//         FROM orders o
//         JOIN order_items i on o.id = i.order_id
//         WHERE o.completed = true
//         GROUP BY TO_CHAR(o.created_at, 'YYYY-MM-DD')
//         ORDER BY TO_CHAR(o.created_at, 'YYYY-MM-DD') ASC;      
//     `;

//     const result = await this.repository.query(query);
//     return result;
//   }
// }
