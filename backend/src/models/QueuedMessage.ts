import { Schema, model, Document } from 'mongoose';

export interface IQueuedMessage extends Document {
  sessionId: string;
  chatId: string;
  content?: string;
  mediaUrl?: string;
  mediaType?: string;
  attempts: number;
  maxAttempts: number;
  status: 'queued' | 'sending' | 'sent' | 'failed';
  nextAttemptAt: Date;
  lastError?: string;
  createdAt: Date;
}

const QueuedMessageSchema = new Schema({
  sessionId: { type: String, required: true },
  chatId: { type: String, required: true },
  content: { type: String },
  mediaUrl: { type: String },
  mediaType: { type: String },
  attempts: { type: Number, default: 0 },
  maxAttempts: { type: Number, default: 5 },
  status: { type: String, enum: ['queued', 'sending', 'sent', 'failed'], default: 'queued' },
  nextAttemptAt: { type: Date, default: Date.now },
  lastError: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export const QueuedMessageModel = model<IQueuedMessage>('QueuedMessage', QueuedMessageSchema);
