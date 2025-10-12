import { Request, Response } from 'express';
import { ScheduledMessageModel } from '../models/ScheduledMessage';

export const createScheduledMessage = async (req: Request, res: Response) => {
  try {
    const { sessionId, chatId, message, schedule } = req.body;
    const scheduledMessage = new ScheduledMessageModel({ sessionId, chatId, message, schedule });
    await scheduledMessage.save();
    res.status(201).json({ success: true, scheduledMessage });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

export const getScheduledMessages = async (req: Request, res: Response) => {
  try {
    const scheduledMessages = await ScheduledMessageModel.find();
    res.status(200).json({ success: true, scheduledMessages });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

export const updateScheduledMessage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { sessionId, chatId, message, schedule } = req.body;
    const scheduledMessage = await ScheduledMessageModel.findByIdAndUpdate(id, { sessionId, chatId, message, schedule }, { new: true });
    res.status(200).json({ success: true, scheduledMessage });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

export const deleteScheduledMessage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await ScheduledMessageModel.findByIdAndDelete(id);
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};
