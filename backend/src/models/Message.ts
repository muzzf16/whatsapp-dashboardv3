import { Schema, model, Document } from 'mongoose';

export interface IMessage extends Document {
  sessionId: string;
  messageId: string;
  chatId: string; // Nomor tujuan/grup
  fromMe: boolean;
  content?: string;
  mediaUrl?: string;
  type: string; // text, image, document
  status: 'sent' | 'delivered' | 'read';
  timestamp: Date;
}

const MessageSchema = new Schema({
  sessionId: { type: String, required: true },
  messageId: { type: String, required: true, unique: true },
  chatId: { type: String, required: true }, // Nomor tujuan/grup
  fromMe: { type: Boolean, required: true },
  content: { type: String },
  mediaUrl: { type: String },
  type: { type: String, default: 'text' }, // text, image, document
  status: { type: String, enum: ['sent', 'delivered', 'read'], default: 'sent' },
  timestamp: { type: Date, default: Date.now }
});

export const MessageModel = model<IMessage>('Message', MessageSchema);