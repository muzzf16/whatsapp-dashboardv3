import { Request, Response, NextFunction } from 'express';
import { ApiConfigModel } from '../models/ApiConfig';

export const apiKeyAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check for API key in header
    const apiKey = req.headers['x-api-key'] as string;
    
    if (!apiKey) {
      return res.status(401).json({
        success: false,
        message: 'API key is required in X-API-Key header'
      });
    }
    
    // Look up the API key in the database
    const config = await ApiConfigModel.findOne({ apiKey });
    
    if (!config) {
      return res.status(401).json({
        success: false,
        message: 'Invalid API key'
      });
    }
    
    // Add config to request object for use in other routes
    (req as any).apiConfig = config;
    
    next();
  } catch (error) {
    console.error('API key authentication error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication error'
    });
  }
};

export const rateLimit = (req: Request, res: Response, next: NextFunction) => {
  // This is a basic rate limiting implementation
  // In production, you would use a more sophisticated solution like express-rate-limit
  // that integrates with Redis for distributed rate limiting
  next();
};