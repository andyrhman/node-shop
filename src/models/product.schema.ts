import mongoose, { Schema, Document } from "mongoose";
import { ProductImagesDocument } from "./product-images.schema";
import { ProductVariationsDocument } from "./product-variation.schema";
import { CategoryDocument } from "./category.schema";
import { CartDocument } from "./cart.schema";
import { OrderItemsDocument } from "./order-items.schema";
import { ReviewDocument } from "./review.schema";

export interface ProductDocument extends Document {
  _id: string;
  title: string;
  slug: string;
  description: string;
  image: string;
  price: number;
  created_at: Date;
  updated_at: Date;
  category_id: CategoryDocument;
  product_images: ProductImagesDocument[];
  variant: ProductVariationsDocument[];
  cart: CartDocument[];
  order_item: OrderItemsDocument[];
  review: ReviewDocument[];
}

export const ProductSchema = new Schema({
  title: {type: String},
  slug: {type: String},
  description: {type: String},
  image: {type: String},
  price: {type: Number},
  category_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Category'},
  product_images: [{type: mongoose.Schema.Types.ObjectId, ref: 'product_images'}],
  variant: [{type: mongoose.Schema.Types.ObjectId, ref: 'product_variations'}],
  cart: [{type: mongoose.Schema.Types.ObjectId, ref: 'Cart'}],
  order_item: [{type: mongoose.Schema.Types.ObjectId, ref: 'order_items'}],
  review: [{type: mongoose.Schema.Types.ObjectId, ref: 'Review'}],
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
});

export const Product = mongoose.model<ProductDocument>('Product', ProductSchema);
