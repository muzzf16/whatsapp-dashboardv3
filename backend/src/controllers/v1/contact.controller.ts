import { Request, Response } from 'express';
import { whatsappService } from '../../services/whatsapp.service';

// Get contacts for a session (v1 API)
export const getContacts = async (req: Request, res: Response) => {
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
    
    // In Baileys, contacts are typically available through the store or events
    // For now, we'll use the chat list as a proxy for contacts
    if (!sock.chats || typeof sock.chats.all !== 'function') {
      console.warn(`Chats not available for session ${sessionId}`);
      return res.status(503).json({
        success: false,
        message: 'Contacts not available yet. Phone may be offline or session still initializing.'
      });
    }

    const chats = sock.chats.all();
    
    // Filter to only include personal chats (not groups)
    const contacts = chats.filter((chat: any) => !chat.id.includes('@g.us'));

    res.status(200).json({
      success: true,
      data: contacts
    });
  } catch (error) {
    console.error('Error getting contacts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get contacts',
      error: (error as Error).message
    });
  }
};

// Search contacts for a session (v1 API)
export const searchContacts = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const { query } = req.query;
    
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Query parameter is required and must be a non-empty string'
      });
    }
    
    // Get the WhatsApp connection for this session
    const sock = whatsappService.getConnection(sessionId);
    
    if (!sock) {
      return res.status(404).json({
        success: false,
        message: 'Session not found or not connected'
      });
    }
    
    // In Baileys, contacts are typically available through the store or events
    // For now, we'll use the chat list as a proxy for contacts
    if (!sock.chats || typeof sock.chats.all !== 'function') {
      console.warn(`Chats not available for session ${sessionId}`);
      return res.status(503).json({
        success: false,
        message: 'Contacts not available yet. Phone may be offline or session still initializing.'
      });
    }

    const chats = sock.chats.all();
    
    // Filter to only include personal chats (not groups) that match the query
    const searchTerm = query.toLowerCase().trim();
    const contacts = chats.filter((chat: any) => 
      !chat.id.includes('@g.us') && 
      (chat.name?.toLowerCase().includes(searchTerm) || 
       chat.id.toLowerCase().includes(searchTerm))
    );

    res.status(200).json({
      success: true,
      data: contacts,
      query: searchTerm
    });
  } catch (error) {
    console.error('Error searching contacts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search contacts',
      error: (error as Error).message
    });
  }
};