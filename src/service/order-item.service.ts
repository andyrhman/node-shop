import { Order, OrderDocument } from "../models/order.schema";
import { OrderItem, OrderItemsDocument } from "../models/order-items.schema";
import { AbstractService } from "./abstract.service";
import { In } from "typeorm";

export class OrderItemService extends AbstractService<OrderItemsDocument> {
  constructor() {
    super(OrderItem);
  }
  async isProductInOrderItems(productId: string, orders: OrderDocument[]) {
    const orderIds = orders.map((order) => order.id);
    const productOrderItems = await this.model.find({
        productId: productId,
        orderId: { $in: orderIds }
    });
    return productOrderItems.length > 0;
  }
}
