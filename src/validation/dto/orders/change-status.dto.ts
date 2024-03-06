import { IsEnum, IsNotEmpty } from "class-validator";
import { OrderItemStatus } from "../../../models/order-items.schema";

export class ChangeStatusDTO{
    @IsNotEmpty()
    @IsEnum(OrderItemStatus)
    status: OrderItemStatus;
}