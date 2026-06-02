import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  createLeague, joinLeague, leaveLeague, getUserLeagues,
  getLeagueMembers, getLeagueById,
  createLeagueValidation, joinLeagueValidation,
} from '../controllers/league.controller';

const router = Router();

router.use(authenticate);

router.get('/', getUserLeagues);
router.post('/', createLeagueValidation, validate, createLeague);
router.post('/join', joinLeagueValidation, validate, joinLeague);
router.get('/:id', getLeagueById);
router.get('/:id/members', getLeagueMembers);
router.delete('/:id/leave', leaveLeague);

export default router;
