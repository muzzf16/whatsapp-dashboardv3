import { Schema, model, Document } from 'mongoose';

export interface IScheduledMessage extends Document {
  sessionId: string;
  chatId: string;
  message: string;
  schedule: Date;
  sent: boolean;
}

const ScheduledMessageSchema = new Schema({
  sessionId: { type: String, required: true },
  chatId: { type: String, required: true },
  message: { type: String, required: true },
  schedule: { type: Date, required: true },
  sent: { type: Boolean, default: false },
});

export const ScheduledMessageModel = model<IScheduledMessage>('ScheduledMessage', ScheduledMessageSchema);
