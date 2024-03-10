import mongoose, { Document, Schema } from "mongoose";
import { AddressDocument } from "./address.schema";
import { CartDocument } from "./cart.schema";
import { OrderDocument } from "./order.schema";
import { ReviewDocument } from "./review.schema";
import { TokenDocument } from "./token.schema";

export interface UserDocument extends Document {
  _id: string;
  fullName: string;
  username: string;
  email: string;
  password: string;
  is_user: boolean;
  is_verified: boolean;
  created_at: Date;
  updated_at: Date;
  address: AddressDocument;
  orders: OrderDocument[];
  cart: CartDocument[];
  review: ReviewDocument[];
  verify: TokenDocument[];
}

export const UserSchema = new Schema(
  {
    fullName: { type: String },
    username: { type: String, unique: true },
    email: { type: String, unique: true },
    password: { type: String },
    is_user: { type: Boolean, default: true },
    is_verified: { type: Boolean, default: false },
    address: { type: mongoose.Schema.Types.ObjectId, ref: "Address", default: undefined},
    cart: {type: [mongoose.Schema.Types.ObjectId], ref: "Cart", default: undefined },
    orders: {type: [mongoose.Schema.Types.ObjectId], ref: "Order", default: undefined },
    verify: {type: [mongoose.Schema.Types.ObjectId], ref: "user_token", default: undefined },
    review: {type: [mongoose.Schema.Types.ObjectId], ref: "Review", default: undefined },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
    toJSON: { virtuals: true }
  }
);

export const User = mongoose.model<UserDocument>("User", UserSchema);
