import { Request, Response } from 'express';
import { whatsappService } from '../../services/whatsapp.service';

// Create a new group (v1 API)
export const createGroup = async (req: Request, res: Response) => {
  try {
    const { sessionId, name, participants } = req.body;

    if (!sessionId || !name || !participants || !Array.isArray(participants)) {
      return res.status(400).json({
        success: false,
        message: 'sessionId, name, and participants (array) are required'
      });
    }

    const group = await whatsappService.createGroup(sessionId, name, participants);

    res.status(200).json({
      success: true,
      data: group,
      message: 'Group created successfully'
    });
  } catch (error) {
    console.error('Error creating group:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create group',
      error: (error as Error).message
    });
  }
};

// Get group metadata (v1 API)
export const getGroupMetadata = async (req: Request, res: Response) => {
  try {
    const { sessionId, groupId } = req.params;

    if (!sessionId || !groupId) {
      return res.status(400).json({
        success: false,
        message: 'sessionId and groupId are required'
      });
    }

    const metadata = await whatsappService.getGroupMetadata(sessionId, groupId);

    res.status(200).json({
      success: true,
      data: metadata,
      message: 'Group metadata retrieved successfully'
    });
  } catch (error) {
    console.error('Error getting group metadata:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get group metadata',
      error: (error as Error).message
    });
  }
};

// Update group subject (v1 API)
export const updateGroupSubject = async (req: Request, res: Response) => {
  try {
    const { sessionId, groupId } = req.params;
    const { subject } = req.body;

    if (!sessionId || !groupId || !subject) {
      return res.status(400).json({
        success: false,
        message: 'sessionId, groupId, and subject are required'
      });
    }

    await whatsappService.updateGroupSubject(sessionId, groupId, subject);

    res.status(200).json({
      success: true,
      message: 'Group subject updated successfully'
    });
  } catch (error) {
    console.error('Error updating group subject:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update group subject',
      error: (error as Error).message
    });
  }
};

// Add participants to group (v1 API)
export const addParticipants = async (req: Request, res: Response) => {
  try {
    const { sessionId, groupId } = req.params;
    const { participants } = req.body;

    if (!sessionId || !groupId || !participants || !Array.isArray(participants)) {
      return res.status(400).json({
        success: false,
        message: 'sessionId, groupId, and participants (array) are required'
      });
    }

    await whatsappService.addParticipants(sessionId, groupId, participants);

    res.status(200).json({
      success: true,
      message: 'Participants added successfully'
    });
  } catch (error) {
    console.error('Error adding participants:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add participants',
      error: (error as Error).message
    });
  }
};

// Remove participants from group (v1 API)
export const removeParticipants = async (req: Request, res: Response) => {
  try {
    const { sessionId, groupId } = req.params;
    const { participants } = req.body;

    if (!sessionId || !groupId || !participants || !Array.isArray(participants)) {
      return res.status(400).json({
        success: false,
        message: 'sessionId, groupId, and participants (array) are required'
      });
    }

    await whatsappService.removeParticipants(sessionId, groupId, participants);

    res.status(200).json({
      success: true,
      message: 'Participants removed successfully'
    });
  } catch (error) {
    console.error('Error removing participants:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove participants',
      error: (error as Error).message
    });
  }
};

// Leave group (v1 API)
export const leaveGroup = async (req: Request, res: Response) => {
  try {
    const { sessionId, groupId } = req.params;

    if (!sessionId || !groupId) {
      return res.status(400).json({
        success: false,
        message: 'sessionId and groupId are required'
      });
    }

    await whatsappService.leaveGroup(sessionId, groupId);

    res.status(200).json({
      success: true,
      message: 'Left group successfully'
    });
  } catch (error) {
    console.error('Error leaving group:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to leave group',
      error: (error as Error).message
    });
  }
};