import mongoose, { Schema, Document } from "mongoose";
import { ProductDocument } from "./product.schema";
import { UserDocument } from "./user.schema";
import { ProductVariationsDocument } from "./product-variation.schema";
import { OrderDocument } from "./order.schema";

export interface CartDocument extends Document {
  _id: string;
  product_title: string;
  quantity: number;
  price: number;
  completed: boolean;
  variant_id: ProductVariationsDocument;
  product_id: ProductDocument;
  user_id: UserDocument;
  order_id: OrderDocument;
  created_at: Date;
}

export const CartSchema = new Schema({
    product_title: {type: String},
    quantity: {type: Number},
    price: {type: Number},
    completed: {type: Boolean, default: false},
    variant_id: {type: mongoose.Schema.Types.ObjectId, ref: 'product_variations', default: undefined},
    product_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Product', default: undefined},
    user_id: {type: mongoose.Schema.Types.ObjectId, ref: 'User', default: undefined},
    order_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: undefined},
},
{
    timestamps: {
        createdAt: 'created_at'
    },
    toJSON: { virtuals: true }
}
);

export const Cart = mongoose.model<CartDocument>('Cart', CartSchema);