import { Router } from 'express';
import { 
  getApiConfig,
  updateApiConfig,
  createApiConfig,
  deleteApiConfig,
  generateApiKey 
} from '../controllers/api-config.controller';

const router = Router();

// Get current API configuration
router.get('/', getApiConfig);

// Update API configuration
router.put('/', updateApiConfig);

// Create initial API configuration
router.post('/', createApiConfig);

// Delete API configuration
router.delete('/', deleteApiConfig);

// Generate a new API key
router.post('/generate-key', generateApiKey);

export const apiConfigRoutes = router;