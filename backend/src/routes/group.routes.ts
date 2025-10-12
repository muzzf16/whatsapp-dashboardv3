import { Router } from 'express';
import { 
  createGroup,
  getGroupMetadata,
  updateGroupSubject,
  addParticipants,
  removeParticipants,
  leaveGroup
} from '../controllers/group.controller';

const router = Router();

router.post('/create', createGroup);
router.get('/:groupId', getGroupMetadata);
router.put('/:groupId/subject', updateGroupSubject);
router.post('/:groupId/participants/add', addParticipants);
router.post('/:groupId/participants/remove', removeParticipants);
router.post('/:groupId/leave', leaveGroup);

export const groupRoutes = router;