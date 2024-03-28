import { IsNotEmpty, IsUUID } from "class-validator";

export class CreateReviewDTO{
    @IsNotEmpty()
    star: number;

    @IsNotEmpty()
    comment: string;

    @IsNotEmpty()
    @IsUUID()
    order_item: string;

    @IsNotEmpty()
    @IsUUID()
    order_id: string;

    @IsNotEmpty()
    @IsUUID()
    product_id: string;

    @IsNotEmpty()
    @IsUUID()
    variant_id: string;

    image: string;
}