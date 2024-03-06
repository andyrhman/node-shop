import mongoose, { Schema, Document } from "mongoose";
import { ProductDocument } from "./product.schema";
import { CartDocument } from "./cart.schema";
import { OrderItemsDocument } from "./order-items.schema";

export interface ProductVariationsDocument extends Document {
  _id: string;
  name: string;
  product: ProductDocument;
  cart: CartDocument[];
  order_item: OrderItemsDocument[];
}

export const ProductVariationsSchema = new Schema({
  name: {type: String},
  product: {type: mongoose.Schema.Types.ObjectId, ref: 'Product'},
  cart: [{type: mongoose.Schema.Types.ObjectId, ref: 'Cart'}],
  order_items: [{type: mongoose.Schema.Types.ObjectId, ref: 'order_items'}]
});

export const ProductVariations = mongoose.model<ProductVariationsDocument>("product_variations", ProductVariationsSchema)