import mongoose, { Schema, model, models } from "mongoose";

export interface UserDocument extends mongoose.Document {
  email: string;
  emailLower: string;
  name?: string | null;
  image?: string | null;
  allowed: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<UserDocument>({
  email: { type: String, required: true },
  emailLower: { type: String, required: true, unique: true, index: true },
  name: { type: String },
  image: { type: String },
  allowed: { type: Boolean, default: false },
  lastLoginAt: { type: Date },
}, { timestamps: true });

export const User = models.User || model<UserDocument>("User", UserSchema);


