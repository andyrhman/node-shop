import { IsNotEmpty, IsMongoId } from "class-validator";

export class CreateReviewDTO{
    @IsNotEmpty()
    star: number;

    @IsNotEmpty()
    comment: string;

    @IsNotEmpty()
    @IsMongoId({message: "Invalid Request"})
    order_item: string;

    @IsNotEmpty()
    @IsMongoId({message: "Invalid Request"})
    order_id: string;

    @IsNotEmpty()
    @IsMongoId({message: "Invalid Request"})
    product_id: string;

    @IsNotEmpty()
    @IsMongoId({message: "Invalid Request"})
    variant_id: string;

    image: string;
}