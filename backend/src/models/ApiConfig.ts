import mongoose, { Schema, Document } from 'mongoose';

export interface IApiConfig extends Document {
  apiKey: string;
  webhookUrl?: string;
  webhookEvents: string[];
  rateLimit: number;
  autoReplyEnabled: boolean;
  autoReplyRules: {
    keyword: string;
    response: string;
    enabled: boolean;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const ApiConfigSchema: Schema = new Schema({
  apiKey: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  webhookUrl: {
    type: String,
    default: null
  },
  webhookEvents: [{
    type: String,
    enum: ['message_received', 'message_sent', 'connection_open', 'connection_close', 'qr_generated'],
    default: ['message_received']
  }],
  rateLimit: {
    type: Number,
    default: 1000 // requests per hour
  },
  autoReplyEnabled: {
    type: Boolean,
    default: false
  },
  autoReplyRules: [{
    keyword: String,
    response: String,
    enabled: {
      type: Boolean,
      default: true
    }
  }]
}, {
  timestamps: true
});

export const ApiConfigModel = mongoose.model<IApiConfig>('ApiConfig', ApiConfigSchema);