import { Router } from 'express';
import { apiKeyAuth } from '../../middleware/auth';
import {
  getContacts,
  searchContacts
} from '../../controllers/v1/contact.controller';

const router = Router();

// Apply API key authentication to all routes in this router
router.use(apiKeyAuth);

// Contact endpoints
router.get('/contacts/:sessionId', getContacts);
router.get('/contacts/:sessionId/search', searchContacts);

export const v1ContactRoutes = router;