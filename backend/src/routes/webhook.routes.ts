import { Router } from 'express';
import { apiKeyAuth } from '../middleware/auth';
import { 
  getWebhookConfig,
  updateWebhookConfig,
  removeWebhookConfig
} from '../controllers/webhook.controller';

const router = Router();

// Apply API key authentication to all routes in this router
router.use(apiKeyAuth);

// Webhook configuration endpoints
router.get('/webhooks', getWebhookConfig);
router.post('/webhooks', updateWebhookConfig);
router.put('/webhooks', updateWebhookConfig);
router.delete('/webhooks', removeWebhookConfig);

export const webhookRoutes = router;