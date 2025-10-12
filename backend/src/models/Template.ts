import { Schema, model, Document } from 'mongoose';

export interface ITemplate extends Document {
  name: string;
  content: string;
}

const TemplateSchema = new Schema({
  name: { type: String, required: true, unique: true },
  content: { type: String, required: true },
});

export const TemplateModel = model<ITemplate>('Template', TemplateSchema);
