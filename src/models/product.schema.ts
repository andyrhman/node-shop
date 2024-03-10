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
  category_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: undefined},
  // ? https://www.phind.com/search?cache=aif0qe2bebiiu3jz57i94oe7
  product_images: {type: [mongoose.Schema.Types.ObjectId], ref: 'product_images', default: undefined},
  variant: {type: [mongoose.Schema.Types.ObjectId], ref: 'product_variations', default: undefined},
  cart: {type: [mongoose.Schema.Types.ObjectId],ref: 'Cart', default: undefined},
  order_item: {type: [mongoose.Schema.Types.ObjectId], ref: 'order_items', default: undefined},
  review: {type: [mongoose.Schema.Types.ObjectId], ref: 'Review', default: undefined},
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
});

export const Product = mongoose.model<ProductDocument>('Product', ProductSchema);
