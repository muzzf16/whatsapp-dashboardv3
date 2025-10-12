import { Request, Response } from 'express';
import { whatsappService } from '../services/whatsapp.service';
import { SessionModel } from '../models/Session';

// Initialize a new WhatsApp session
export const initSession = async (req: Request, res: Response) => {
  try {
    // Generate a unique session ID
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create a new session in the database
    const newSession = new SessionModel({
      sessionId,
      sessionData: {},
      status: 'DISCONNECTED'
    });
    
    await newSession.save();
    
    // Create WhatsApp connection
    await whatsappService.createConnection(sessionId);
    
    res.status(200).json({
      success: true,
      message: 'Session initialized successfully',
      sessionId
    });
  } catch (error) {
    console.error('Error initializing session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initialize session',
      error: (error as Error).message
    });
  }
};

// Get all sessions
export const getSessions = async (req: Request, res: Response) => {
  try {
    const sessions = await SessionModel.find().select('-sessionData'); // Don't return session data for security
    
    res.status(200).json({
      success: true,
      sessions
    });
  } catch (error) {
    console.error('Error getting sessions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get sessions',
      error: (error as Error).message
    });
  }
};

// Delete a session
export const deleteSession = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Logout from WhatsApp if connected
    await whatsappService.logout(id);
    
    // Delete session from database
    await SessionModel.deleteOne({ sessionId: id });
    
    res.status(200).json({
      success: true,
      message: 'Session deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete session',
      error: (error as Error).message
    });
  }
};

// Logout from a session
export const logout = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    await whatsappService.logout(sessionId);
    res.status(200).json({ 
      success: true, 
      message: 'Logged out successfully' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to log out' 
    });
  }
};

// Reconnect an existing session (attempt to create/recreate socket)
export const reconnectSession = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    await whatsappService.createConnection(sessionId);
    res.status(200).json({ success: true, message: 'Reconnect attempted' });
  } catch (error) {
    console.error('Error reconnecting session:', error);
    res.status(500).json({ success: false, message: 'Failed to reconnect session', error: (error as Error).message });
  }
};

// Get status of active websocket connections
export const getStatus = async (req: Request, res: Response) => {
  try {
    const active = whatsappService.getAllConnections();
    res.status(200).json({ success: true, activeConnections: active });
  } catch (error) {
    console.error('Error getting connections status:', error);
    res.status(500).json({ success: false, message: 'Failed to get connections status' });
  }
};

// Get latest QR for a session (if available)
export const getSessionQr = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const qr = whatsappService.getQr(sessionId);
    res.status(200).json({ success: true, qr });
  } catch (error) {
    console.error('Error getting session QR:', error);
    res.status(500).json({ success: false, message: 'Failed to get session QR' });
  }
};

// Debug: return minimal socket metadata for a session (safe to expose in dev)
export const getSessionDebug = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const sock = whatsappService.getConnection(sessionId) as any;
    if (!sock) return res.status(404).json({ success: false, message: 'Session not found' });

    const debug = {
      connected: !!(sock.ws ? sock.ws.readyState === 1 : true),
      user: sock.user || null,
      chatsCount: sock.chats && typeof sock.chats.all === 'function' ? sock.chats.all().length : 0,
      sampleChats: sock.chats && typeof sock.chats.all === 'function' ? sock.chats.all().slice(0, 10) : []
    };

    res.status(200).json({ success: true, debug });
  } catch (error) {
    console.error('Error getting session debug:', error);
    res.status(500).json({ success: false, message: 'Failed to get session debug' });
  }
};