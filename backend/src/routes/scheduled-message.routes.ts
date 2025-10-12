import { Router } from 'express';
import { 
  createScheduledMessage,
  getScheduledMessages,
  updateScheduledMessage,
  deleteScheduledMessage
} from '../controllers/scheduled-message.controller';

const router = Router();

router.post('/', createScheduledMessage);
router.get('/', getScheduledMessages);
router.put('/:id', updateScheduledMessage);
router.delete('/:id', deleteScheduledMessage);

export const scheduledMessageRoutes = router;
