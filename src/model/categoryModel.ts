import mongoose, { Schema, Document } from 'mongoose';

export interface CategoryDocument extends Document {
  name: string;
  id: string;
}

const CategorySchema: Schema<CategoryDocument> = new Schema({
  name: { type: String, required: true, unique: true },

});

export const CategoryModel = mongoose.model<CategoryDocument>('Category', CategorySchema);
