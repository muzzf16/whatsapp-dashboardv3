import { Request, Response } from 'express';
import { whatsappService } from '../services/whatsapp.service';

export const createGroup = async (req: Request, res: Response) => {
  try {
    const { sessionId, name, participants } = req.body;
    const group = await whatsappService.createGroup(sessionId, name, participants);
    res.status(200).json({ success: true, group });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

export const getGroupMetadata = async (req: Request, res: Response) => {
  try {
    const { sessionId, groupId } = req.params;
    const metadata = await whatsappService.getGroupMetadata(sessionId, groupId);
    res.status(200).json({ success: true, metadata });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

export const updateGroupSubject = async (req: Request, res: Response) => {
  try {
    const { sessionId, groupId } = req.params;
    const { subject } = req.body;
    await whatsappService.updateGroupSubject(sessionId, groupId, subject);
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

export const addParticipants = async (req: Request, res: Response) => {
  try {
    const { sessionId, groupId } = req.params;
    const { participants } = req.body;
    await whatsappService.addParticipants(sessionId, groupId, participants);
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

export const removeParticipants = async (req: Request, res: Response) => {
  try {
    const { sessionId, groupId } = req.params;
    const { participants } = req.body;
    await whatsappService.removeParticipants(sessionId, groupId, participants);
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

export const leaveGroup = async (req: Request, res: Response) => {
  try {
    const { sessionId, groupId } = req.params;
    await whatsappService.leaveGroup(sessionId, groupId);
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};
