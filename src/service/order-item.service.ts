import { Order, OrderDocument } from "../models/order.schema";
import { OrderItem, OrderItemsDocument } from "../models/order-items.schema";
import { AbstractService } from "./abstract.service";
import { In } from "typeorm";

export class OrderItemService extends AbstractService<OrderItemsDocument> {
  constructor() {
    super(OrderItem);
  }
}
