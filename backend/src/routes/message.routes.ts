import { Router } from 'express';
import { 
  sendMessage,
  sendMessageWithMedia,
  getChats,
  getMessages
} from '../controllers/message.controller';

const router = Router();

router.post('/send', sendMessage);
router.post('/send-media', sendMessageWithMedia);
router.get('/chats/:sessionId', getChats);
router.get('/messages/:chatId', getMessages);

export const messageRoutes = router;