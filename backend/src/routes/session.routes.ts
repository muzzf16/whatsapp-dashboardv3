import { Router } from 'express';
import { 
  initSession, 
  getSessions, 
  deleteSession,
  logout
  , getStatus,
  getSessionQr,
  getSessionDebug
  , reconnectSession
} from '../controllers/session.controller';

const router = Router();

router.post('/init', initSession);
router.get('/', getSessions);
router.get('/status', getStatus);
router.get('/:sessionId/debug', getSessionDebug);
router.get('/:sessionId/qr', getSessionQr);
router.post('/:sessionId/reconnect', reconnectSession);
router.delete('/:id', deleteSession);
router.post('/logout/:sessionId', logout);

export const sessionRoutes = router;