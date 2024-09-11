import { IsEnum, IsNotEmpty } from "class-validator";
import { OrderItemStatus } from "@prisma/client";

export class ChangeStatusDTO{
    @IsNotEmpty()
    @IsEnum(OrderItemStatus)
    status: OrderItemStatus;
}