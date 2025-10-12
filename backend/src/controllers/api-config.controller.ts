import { Request, Response } from 'express';
import { ApiConfigModel } from '../models/ApiConfig';
import { randomBytes } from 'crypto';

// Get current API configuration
export const getApiConfig = async (req: Request, res: Response) => {
  try {
    // Get the first configuration (there should be just one for now)
    const config = await ApiConfigModel.findOne({});
    
    if (!config) {
      return res.status(200).json({
        success: true,
        data: null,
        message: 'No API configuration found'
      });
    }
    
    // Return config without exposing sensitive data
    const { apiKey, ...configData } = config.toObject();
    res.status(200).json({
      success: true,
      data: configData
    });
  } catch (error) {
    console.error('Error getting API config:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get API configuration',
      error: (error as Error).message
    });
  }
};

// Create API configuration
export const createApiConfig = async (req: Request, res: Response) => {
  try {
    const { webhookUrl, webhookEvents, rateLimit, autoReplyEnabled, autoReplyRules } = req.body;
    
    // Generate a new API key if not provided
    const apiKey = generateApiKeyInternal();
    
    const newConfig = new ApiConfigModel({
      apiKey,
      webhookUrl,
      webhookEvents: webhookEvents || ['message_received'],
      rateLimit: rateLimit || 1000,
      autoReplyEnabled: autoReplyEnabled || false,
      autoReplyRules: autoReplyRules || []
    });
    
    await newConfig.save();
    
    // Return only the public config data, not the API key
    const { apiKey: _, ...configData } = newConfig.toObject();
    
    res.status(201).json({
      success: true,
      data: configData,
      message: 'API configuration created successfully',
      apiKey // Only return the API key at creation time
    });
  } catch (error) {
    console.error('Error creating API config:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create API configuration',
      error: (error as Error).message
    });
  }
};

// Update API configuration
export const updateApiConfig = async (req: Request, res: Response) => {
  try {
    const { webhookUrl, webhookEvents, rateLimit, autoReplyEnabled, autoReplyRules } = req.body;
    
    const updateData: any = {};
    if (webhookUrl !== undefined) updateData.webhookUrl = webhookUrl;
    if (webhookEvents !== undefined) updateData.webhookEvents = webhookEvents;
    if (rateLimit !== undefined) updateData.rateLimit = rateLimit;
    if (autoReplyEnabled !== undefined) updateData.autoReplyEnabled = autoReplyEnabled;
    if (autoReplyRules !== undefined) updateData.autoReplyRules = autoReplyRules;
    
    const updatedConfig = await ApiConfigModel.findOneAndUpdate(
      {}, // Filter - empty object means match the first document
      updateData, 
      {
        new: true,
        upsert: true, // Create if doesn't exist
        useFindAndModify: false // Use native findOneAndUpdate instead of deprecated findAndModify
      }
    );
    
    // Return config without exposing the API key
    const { apiKey: _, ...configData } = updatedConfig!.toObject();
    
    res.status(200).json({
      success: true,
      data: configData,
      message: 'API configuration updated successfully'
    });
  } catch (error) {
    console.error('Error updating API config:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update API configuration',
      error: (error as Error).message
    });
  }
};

// Delete API configuration
export const deleteApiConfig = async (req: Request, res: Response) => {
  try {
    await ApiConfigModel.deleteMany({}); // Delete all configs
    
    res.status(200).json({
      success: true,
      message: 'API configuration deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting API config:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete API configuration',
      error: (error as Error).message
    });
  }
};

// Generate a new API key
export const generateApiKey = async (req: Request, res: Response) => {
  try {
    const newApiKey = generateApiKeyInternal();
    
    // Update the existing config with the new API key
    const updatedConfig = await ApiConfigModel.findOneAndUpdate(
      {},
      { apiKey: newApiKey },
      { new: true, upsert: true }
    );
    
    res.status(200).json({
      success: true,
      apiKey: newApiKey,
      message: 'New API key generated successfully'
    });
  } catch (error) {
    console.error('Error generating API key:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate API key',
      error: (error as Error).message
    });
  }
};

// Internal function to generate an API key
const generateApiKeyInternal = (): string => {
  return randomBytes(32).toString('hex');
};