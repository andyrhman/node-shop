import mongoose, { Schema, Document } from "mongoose";
import { UserDocument } from "./user.schema";
import { ProductDocument } from "./product.schema";
import { OrderDocument } from "./order.schema";
import { ProductVariationsDocument } from "./product-variation.schema";

export interface ReviewDocument extends Document {
    _id: string;
    star: number;
    comment: string;        
    image: string;
    user_id: UserDocument;
    product_id: ProductDocument;
    order_id: OrderDocument;
    variant_id: ProductVariationsDocument;
    created_at: Date;
}

export const ReviewSchema = new Schema({
    star: {type: Number},
    comment: {type: String},
    image: {type: String},
    user_id: {type: mongoose.Schema.Types.ObjectId, ref: 'User', default: undefined},
    product_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Product', default: undefined}, 
    order_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: undefined},
    variant_id: {type: mongoose.Schema.Types.ObjectId, ref: 'product_variations', default: undefined},
}, {
    timestamps: {
        createdAt: 'created_at'
    }
});

export const Review = mongoose.model<ReviewDocument>('Review', ReviewSchema);