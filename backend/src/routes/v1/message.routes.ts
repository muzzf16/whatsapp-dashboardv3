import { Router } from 'express';
import { apiKeyAuth } from '../../middleware/auth';
import { 
  sendMessage,
  sendMessageWithMedia,
  getChats,
  getMessages,
  sendTemplateMessage
} from '../../controllers/v1/message.controller';

const router = Router();

// Apply API key authentication to all routes in this router
router.use(apiKeyAuth);

// Message endpoints
router.post('/messages/send', sendMessage);
router.post('/messages/send-media', sendMessageWithMedia);
router.post('/messages/send-template', sendTemplateMessage);
router.get('/messages/:chatId', getMessages);
router.get('/chats/:sessionId', getChats);

export const v1ApiRoutes = router;