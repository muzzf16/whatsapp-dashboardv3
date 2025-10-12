import { Schema, model, Document } from 'mongoose';

export interface ISession extends Document {
  sessionId: string;
  sessionData: any; // Credentials dari Baileys
  phoneNumber?: string;
  status: 'CONNECTED' | 'DISCONNECTED';
  createdAt: Date;
}

const SessionSchema = new Schema({
  sessionId: { type: String, required: true, unique: true },
  sessionData: { type: Object, required: true }, // Credentials dari Baileys
  phoneNumber: { type: String },
  status: { type: String, enum: ['CONNECTED', 'DISCONNECTED'], default: 'DISCONNECTED' },
  createdAt: { type: Date, default: Date.now }
});

export const SessionModel = model<ISession>('Session', SessionSchema);