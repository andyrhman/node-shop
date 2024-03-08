import mongoose, { Schema, Document } from "mongoose";
import { UserDocument } from "./user.schema";

export interface AddressDocument extends Document {
  _id: string;
  street: string;
  city: string;
  province: string;
  zip: string;
  country: string;
  phone: string;
  user_id: UserDocument;
}

export const AddressSchema = new Schema({
  street: {type: String},
  city: {type: String},
  province: {type: String},
  zip: {type: String},
  country: {type: String},
  phone: {type: String},
  user_id: {type: mongoose.Schema.Types.ObjectId, ref: "User"}
}, {
  collection: 'address'
});

export const Address = mongoose.model<AddressDocument>("Address", AddressSchema);