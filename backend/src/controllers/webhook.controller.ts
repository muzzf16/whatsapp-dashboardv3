import { Request, Response } from 'express';
import { ApiConfigModel } from '../models/ApiConfig';

// Get webhook configuration
export const getWebhookConfig = async (req: Request, res: Response) => {
  try {
    const config = await ApiConfigModel.findOne();
    
    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'Webhook configuration not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        webhookUrl: config.webhookUrl,
        webhookEvents: config.webhookEvents
      }
    });
  } catch (error) {
    console.error('Error getting webhook config:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get webhook configuration',
      error: (error as Error).message
    });
  }
};

// Set/update webhook configuration
export const updateWebhookConfig = async (req: Request, res: Response) => {
  try {
    const { webhookUrl, webhookEvents } = req.body;
    
    if (!webhookUrl) {
      return res.status(400).json({
        success: false,
        message: 'webhookUrl is required'
      });
    }
    
    const config = await ApiConfigModel.findOneAndUpdate(
      {},
      { 
        webhookUrl,
        webhookEvents: webhookEvents || ['message_received']
      },
      { 
        new: true,
        upsert: true
      }
    );
    
    res.status(200).json({
      success: true,
      message: 'Webhook configuration updated successfully',
      data: {
        webhookUrl: config!.webhookUrl,
        webhookEvents: config!.webhookEvents
      }
    });
  } catch (error) {
    console.error('Error updating webhook config:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update webhook configuration',
      error: (error as Error).message
    });
  }
};

// Remove webhook configuration
export const removeWebhookConfig = async (req: Request, res: Response) => {
  try {
    await ApiConfigModel.findOneAndUpdate(
      {},
      { 
        webhookUrl: null,
        webhookEvents: ['message_received']
      }
    );
    
    res.status(200).json({
      success: true,
      message: 'Webhook configuration removed successfully'
    });
  } catch (error) {
    console.error('Error removing webhook config:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove webhook configuration',
      error: (error as Error).message
    });
  }
};