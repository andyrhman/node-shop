// import myDataSource from "../config/db.config";
// import { Order } from "../entity/order.entity";
// import { OrderItem } from "../entity/order-items.entity";
// import { AbstractService } from "./abstract.service";
// import { In } from "typeorm";

// export class OrderItemService extends AbstractService<OrderItem> {
//   constructor() {
//     super(myDataSource.getRepository(OrderItem));
//   }
//   async isProductInOrderItems(productId: string, orders: Order[]) {
//     const orderIds = orders.map((order) => order.id);
//     const productOrderItems = await this.repository.find({
//       where: { product_id: productId, order_id: In(orderIds) },
//     });
//     return productOrderItems.length > 0;
//   }
// }
