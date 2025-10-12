import { Request, Response } from 'express';
import { whatsappService } from '../../services/whatsapp.service';
import { MessageModel } from '../../models/Message';
import { proto } from '@whiskeysockets/baileys';
import upload from '../../utils/upload';

// Send a text message (v1 API)
export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { sessionId, jid, message, options = {} } = req.body;
    
    if (!sessionId || !jid || !message) {
      return res.status(400).json({
        success: false,
        message: 'sessionId, jid, and message are required'
      });
    }
    
    // Send the message using WhatsApp service
    const response = await whatsappService.sendMessage(sessionId, jid, {
      conversation: message,
      ...options
    });
    
    // Save message to database
    const newMessage = new MessageModel({
      sessionId,
      chatId: jid,
      fromMe: true,
      content: message,
      type: 'text',
      status: 'sent'
    });
    
    await newMessage.save();
    
    res.status(200).json({
      success: true,
      message: 'Message sent successfully',
      response,
      messageId: response?.key?.id
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: (error as Error).message
    });
  }
};

// Send a message with media (v1 API)
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
      
      // Save message to database
      const newMessage = new MessageModel({
        sessionId,
        chatId: jid,
        fromMe: true,
        content: message,
        mediaUrl: media.path,
        type: mediaType || 'document',
        status: 'sent'
      });
      
      await newMessage.save();
      
      res.status(200).json({
        success: true,
        message: 'Media message sent successfully',
        response,
        messageId: response?.key?.id
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

// Send a template message (v1 API)
export const sendTemplateMessage = async (req: Request, res: Response) => {
  try {
    const { sessionId, jid, templateName, parameters } = req.body;
    
    if (!sessionId || !jid || !templateName) {
      return res.status(400).json({
        success: false,
        message: 'sessionId, jid, and templateName are required'
      });
    }
    
    // For now, we'll implement a basic template functionality
    // In a real implementation, this would use actual WhatsApp template messages
    const templateMessage = `Template: ${templateName}\nParameters: ${JSON.stringify(parameters || {})}`;
    
    const response = await whatsappService.sendMessage(sessionId, jid, {
      conversation: templateMessage
    });
    
    // Save message to database
    const newMessage = new MessageModel({
      sessionId,
      chatId: jid,
      fromMe: true,
      content: templateMessage,
      type: 'template',
      status: 'sent'
    });
    
    await newMessage.save();
    
    res.status(200).json({
      success: true,
      message: 'Template message sent successfully',
      response,
      messageId: response?.key?.id
    });
  } catch (error) {
    console.error('Error sending template message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send template message',
      error: (error as Error).message
    });
  }
};

// Get chats for a session (v1 API)
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
      data: chats
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

// Get messages for a chat (v1 API)
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
      data: {
        messages,
        totalPages: Math.ceil(totalMessages / limitNum),
        currentPage: pageNum,
        totalMessages
      }
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