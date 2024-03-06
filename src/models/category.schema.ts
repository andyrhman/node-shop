import mongoose, { Schema, Document } from "mongoose";
import { ProductDocument } from "./product.schema";

export interface CategoryDocument extends Document {
    _id: string;
    name: string;
    product: ProductDocument[];
}

export const CategorySchema = new Schema({
    name: {type: String},
    product: [{type: mongoose.Schema.Types.ObjectId, ref: 'Product'}]
});

export const Category = mongoose.model<CategoryDocument>("Category", CategorySchema);
