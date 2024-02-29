import { IsEnum, IsNotEmpty } from "class-validator";
import { OrderItemStatus } from "../../../entity/order-items.entity";

export class ChangeStatusDTO{
    @IsNotEmpty()
    @IsEnum(OrderItemStatus)
    status: OrderItemStatus;
}