import mongoose, { Schema, Document } from "mongoose";

export interface ResetDocument extends Document {
  _id: string;
  email: string;
  token: string;
  expiresAt: bigint;
  used: boolean;
}

export const ResetSchema = new Schema({
    email: {type: String},
    token: {type: String, unique: true},
    expiresAt: {type: BigInt},
    user: {type: Boolean}
}, {
  collection: 'reset'
}
);

export const Reset = mongoose.model<ResetDocument>('Reset', ResetSchema);