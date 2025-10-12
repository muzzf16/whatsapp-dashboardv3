import { Request, Response } from 'express';
import { whatsappService } from '../../services/whatsapp.service';
import { SessionModel } from '../../models/Session';

// Initialize a new WhatsApp session (v1 API)
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
      data: {
        sessionId
      }
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

// Get all sessions (v1 API)
export const getSessions = async (req: Request, res: Response) => {
  try {
    const sessions = await SessionModel.find().select('-sessionData'); // Don't return session data for security
    
    res.status(200).json({
      success: true,
      data: {
        sessions,
        total: sessions.length
      }
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

// Get a specific session by ID (v1 API)
export const getSessionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const session = await SessionModel.findOne({ sessionId: id }).select('-sessionData');
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: session
    });
  } catch (error) {
    console.error('Error getting session by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get session',
      error: (error as Error).message
    });
  }
};

// Delete a session (v1 API)
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

// Logout from a session (v1 API)
export const logout = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await whatsappService.logout(id);
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

// Get status of active websocket connections (v1 API)
export const getStatus = async (req: Request, res: Response) => {
  try {
    const active = whatsappService.getAllConnections();
    res.status(200).json({ 
      success: true, 
      data: { 
        activeConnections: active,
        total: active.length
      } 
    });
  } catch (error) {
    console.error('Error getting connections status:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get connections status' 
    });
  }
};

// Get latest QR for a session (if available) (v1 API)
export const getSessionQr = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const qr = whatsappService.getQr(id);
    res.status(200).json({ 
      success: true, 
      data: { qr } 
    });
  } catch (error) {
    console.error('Error getting session QR:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get session QR' 
    });
  }
};

// Check health of a specific session connection (v1 API)
export const checkSessionHealth = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const health = await whatsappService.isConnectionHealthy(id);
    
    // Update database status if needed
    if (!health.connected) {
      await SessionModel.updateOne(
        { sessionId: id },
        { status: 'DISCONNECTED' }
      );
    }
    
    res.status(200).json({ 
      success: true, 
      data: { 
        sessionId: id,
        ...health
      } 
    });
  } catch (error) {
    console.error('Error checking session health:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to check session health',
      error: (error as Error).message
    });
  }
};