import mongoose, { Schema, Document } from "mongoose";
import { UserDocument } from "./user.schema";
import { CartDocument } from "./cart.schema";
import { OrderItemsDocument } from "./order-items.schema";
import { ReviewDocument } from "./review.schema";

export interface OrderDocument extends Document{
    _id: string;
    transaction_id: string;
    name: string;
    email: string;
    completed: boolean;
    user_id: UserDocument;
    order_items: OrderItemsDocument[];
    cart: CartDocument[];
    review: ReviewDocument[];
    created_at: Date;
}

export const OrderSchema = new Schema({
    transaction_id: {type: String},
    name: {type: String},
    email: {type: String},
    completed: {type: Boolean},
    user_id: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    order_items: [{type: mongoose.Schema.Types.ObjectId, ref: 'order_items'}],
    review: [{type: mongoose.Schema.Types.ObjectId, ref: 'Review'}]
}, {
    timestamps: {
        createdAt: 'created_at'
    }
});

export const Order = mongoose.model<OrderDocument>('Order', OrderSchema);