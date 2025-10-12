import { Router } from 'express';
import { apiKeyAuth } from '../../middleware/auth';
import { 
  initSession,
  getSessions,
  getSessionById,
  deleteSession,
  logout,
  getStatus,
  getSessionQr,
  checkSessionHealth
} from '../../controllers/v1/session.controller';

const router = Router();

// Apply API key authentication to all routes in this router
router.use(apiKeyAuth);

// Session endpoints
router.post('/sessions', initSession);
router.get('/sessions', getSessions);
router.get('/sessions/:id', getSessionById);
router.delete('/sessions/:id', deleteSession);
router.post('/sessions/:id/logout', logout);
router.get('/sessions/status', getStatus);
router.get('/sessions/:id/qr', getSessionQr);
router.get('/sessions/:id/health', checkSessionHealth);

export const v1SessionRoutes = router;