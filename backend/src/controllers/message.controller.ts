import { Request, Response } from 'express';
import { whatsappService } from '../services/whatsapp.service';
import { MessageModel } from '../models/Message';
import { proto } from '@whiskeysockets/baileys';
import upload from '../utils/upload';

// Send a text message
export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { sessionId, jid, message } = req.body;
    
    if (!sessionId || !jid || !message) {
      return res.status(400).json({
        success: false,
        message: 'sessionId, jid, and message are required'
      });
    }
    
    // Normalize JID: if user passed bare number, append @s.whatsapp.net
    const normalizeJid = (j: string) => j.includes('@') ? j : `${j}@s.whatsapp.net`;
    const sendJid = normalizeJid(jid);

    // Ensure connection exists and is open; if not, enqueue the message
    const sock = whatsappService.getConnection(sessionId);
    if (!sock || (sock.ws && sock.ws.readyState !== 1)) {
      // Enqueue for later delivery
      const queued = await whatsappService.enqueueMessage({ sessionId, chatId: sendJid, content: message });
      // Notify frontend that message was queued and connection is unavailable
      try { 
        // emit via socket.io so UI can react
        const { io } = await import('../app');
        io.emit('message_queued', { sessionId, chatId: sendJid, queuedId: queued._id.toString() });
      } catch (err) {
        console.warn('Failed emitting message_queued event:', err);
      }
      return res.status(202).json({ success: true, message: 'Connection unavailable, message queued', queuedId: queued._id });
    }

    // Try sending immediately
    try {
      const response = await whatsappService.sendMessage(sessionId, sendJid, {
        conversation: message
      });

      res.status(200).json({
        success: true,
        message: 'Message sent successfully',
        response
      });
    } catch (err) {
      console.error('Immediate send failed, enqueueing message:', err);
      const queued = await whatsappService.enqueueMessage({ sessionId, chatId: sendJid, content: message });
      try { 
        const { io } = await import('../app');
        io.emit('message_queued', { sessionId, chatId: sendJid, queuedId: queued._id.toString(), error: (err as Error).message });
      } catch (err2) {
        console.warn('Failed emitting message_queued event after immediate send failure:', err2);
      }
      return res.status(202).json({ success: true, message: 'Send failed, message queued for retry', queuedId: queued._id, error: (err as Error).message });
    }
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: (error as Error).message
    });
  }
};

// Send a message with media
export const sendMessageWithMedia = [
  upload.single('media'),
  async (req: Request, res: Response) => {
    try {
      const { sessionId, jid, message, mediaType } = req.body;
      const media = req.file;
      
      if (!sessionId || !jid || !media) {
        return res.status(400).json({
          success: false,
          message: 'sessionId, jid, and media are required'
        });
      }
      
      const response = await whatsappService.sendMediaMessage(sessionId, jid, media, mediaType, message);
      
      res.status(200).json({
        success: true,
        message: 'Media message sent successfully',
        response
      });
    } catch (error) {
      console.error('Error sending media message:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send media message',
        error: (error as Error).message
      });
    }
  }
];

// Get chats for a session
export const getChats = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    
    // Get the WhatsApp connection for this session
    const sock = whatsappService.getConnection(sessionId);
    
    if (!sock) {
      return res.status(404).json({
        success: false,
        message: 'Session not found or not connected'
      });
    }
    
    // Get chat list from WhatsApp
    // Guard: sock.chats may be undefined if the socket hasn't populated chats yet
    if (!sock.chats || typeof sock.chats.all !== 'function') {
      console.warn(`Chats not available for session ${sessionId}`);
      return res.status(503).json({
        success: false,
        message: 'Chats not available yet. Phone may be offline or session still initializing.'
      });
    }

    const chats = sock.chats.all();

    res.status(200).json({
      success: true,
      chats
    });
  } catch (error) {
    console.error('Error getting chats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get chats',
      error: (error as Error).message
    });
  }
};

// Get messages for a chat
export const getMessages = async (req: Request, res: Response) => {
  try {
    const { chatId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    
    // Get messages from database for this chat with pagination
    const messages = await MessageModel.find({ chatId })
      .sort({ timestamp: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);
      
    const totalMessages = await MessageModel.countDocuments({ chatId });
    
    res.status(200).json({
      success: true,
      messages,
      totalPages: Math.ceil(totalMessages / limitNum),
      currentPage: pageNum
    });
  } catch (error) {
    console.error('Error getting messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get messages',
      error: (error as Error).message
    });
  }
};