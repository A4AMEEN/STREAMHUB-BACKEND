import mongoose, { Schema, Document } from 'mongoose';

export interface GoogleUserDocument extends Document {
    googleId: string;
    email: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
}

const GoogleUserSchema: Schema<GoogleUserDocument> = new Schema({
    googleId: { type: String, required: true, unique: true },
    email: { type: String, required: true },
    name: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

export const GoogleUserModel = mongoose.model<GoogleUserDocument>('GoogleUser', GoogleUserSchema);