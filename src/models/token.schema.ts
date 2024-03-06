import mongoose, { Schema, Document } from "mongoose";
import { UserDocument } from "./user.schema";

export interface TokenDocument extends Document {
  _id: string;
  email: string;
  token: string;
  expiresAt: number; // Store the expiration timestamp in milliseconds
  used: boolean;
  user_id: UserDocument;
}

export const TokenSchema = new Schema({
    email: {type: String},
    token: {type: String},
    expiresAt: {type: Number},
    user: {type: Boolean},
    user_id: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
},{
  collection: 'user_token'
}
);

export const Token = mongoose.model<TokenDocument>('user_token', TokenSchema);