import mongoose, { Schema, Document } from "mongoose";
import { OrderDocument } from "./order.schema";
import { ProductDocument } from "./product.schema";
import { ProductVariationsDocument } from "./product-variation.schema";

export enum OrderItemStatus {
    SedangDikemas = 'Sedang Dikemas',
    Dikirim = 'Dikirim',
    Selesai = 'Selesai',
}

export interface OrderItemsDocument extends Document{
    _id: string;
    product_title: string;
    price: number;
    quantity: number;
    variant_id: ProductVariationsDocument;
    order_id: OrderDocument;
    product_id: ProductDocument;
    status: OrderItemStatus;
}

export const OrderItemsSchema = new Schema({
    product_title: {type: String},
    price: {Number},
    quantity: {Number},
    variant_id: {type: mongoose.Schema.Types.ObjectId, ref: 'product_variations'},
    order_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Order'},
    product_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Product'},
    status: {
        type: String,
        enum: Object.values(OrderItemStatus),
        default: OrderItemStatus.SedangDikemas, 
    }
})

export const OrderItem = mongoose.model<OrderItemsDocument>('order_items', OrderItemsSchema);