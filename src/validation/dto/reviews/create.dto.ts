import { IsNotEmpty, IsMongoId } from "class-validator";

export class CreateReviewDTO{
    @IsNotEmpty()
    star: number;

    @IsNotEmpty()
    comment: string;

    @IsNotEmpty()
    @IsMongoId()
    product_id: string;

    image: string;
}