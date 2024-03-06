import mongoose, { Schema, Document } from "mongoose";
import { ProductDocument } from "./product.schema";

export interface ProductImagesDocument extends Document {
  _id: string;
  image: string;
  productId: ProductDocument;
}

export const ProductImagesSchema = new Schema({
  image: {type: String},
  productId: {type: mongoose.Schema.Types.ObjectId, ref: 'Product'}
});

export const ProductImages = mongoose.model<ProductImagesDocument>("product_images", ProductImagesSchema);