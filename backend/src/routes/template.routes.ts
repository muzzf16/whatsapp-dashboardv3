import { Router } from 'express';
import { 
  createTemplate,
  getTemplates,
  updateTemplate,
  deleteTemplate
} from '../controllers/template.controller';

const router = Router();

router.post('/', createTemplate);
router.get('/', getTemplates);
router.put('/:id', updateTemplate);
router.delete('/:id', deleteTemplate);

export const templateRoutes = router;
