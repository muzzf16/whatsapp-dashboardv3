import { Router } from 'express';
import { apiKeyAuth } from '../../middleware/auth';
import { 
  createGroup,
  getGroupMetadata,
  updateGroupSubject,
  addParticipants,
  removeParticipants,
  leaveGroup
} from '../../controllers/v1/group.controller';

const router = Router();

// Apply API key authentication to all routes in this router
router.use(apiKeyAuth);

// Group endpoints
router.post('/groups', createGroup);
router.get('/groups/:groupId', getGroupMetadata);
router.put('/groups/:groupId/subject', updateGroupSubject);
router.post('/groups/:groupId/participants/add', addParticipants);
router.post('/groups/:groupId/participants/remove', removeParticipants);
router.post('/groups/:groupId/leave', leaveGroup);

export const v1GroupRoutes = router;