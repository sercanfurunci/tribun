import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { getLeagueLeaderboard } from '../controllers/leaderboard.controller';

const router = Router();

router.use(authenticate);
router.get('/:leagueId', getLeagueLeaderboard);

export default router;
