import { Router } from 'express';
import { listQueuedMessages } from '../controllers/queuedMessage.controller';

const router = Router();

router.get('/', listQueuedMessages);

export const queuedMessageRoutes = router;
