import { Request, Response } from 'express';
import { QueuedMessageModel } from '../models/QueuedMessage';

export const listQueuedMessages = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.query;
    const filter: any = {};
    if (sessionId) filter.sessionId = sessionId;

    const queued = await QueuedMessageModel.find(filter).sort({ nextAttemptAt: 1 }).limit(200);
    res.status(200).json({ success: true, queued });
  } catch (error) {
    console.error('Error listing queued messages:', error);
    res.status(500).json({ success: false, message: 'Failed to list queued messages' });
  }
};
