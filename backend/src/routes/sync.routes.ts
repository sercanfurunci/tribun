import { Router } from 'express';
import {
  syncFixtures,
  syncLive,
  scoreMatches,
  searchLeagues,
  apiStatus,
  getRounds,
  getStandings,
  getFixtureEvents,
  getApiPrediction,
  getTopScorers,
  scoreMatch,
} from '../controllers/sync.controller';
import { requireApiSecret } from '../middleware/apiSecret';

const router = Router();

router.use(requireApiSecret);

router.get('/status', apiStatus);
router.get('/leagues', searchLeagues);
router.get('/rounds', getRounds);
router.get('/standings', getStandings);
router.get('/events/:fixtureId', getFixtureEvents);
router.get('/predictions/:fixtureId', getApiPrediction);
router.get('/topscorers', getTopScorers);

router.post('/fixtures', syncFixtures);
router.post('/live', syncLive);
router.post('/score', scoreMatches);
router.post('/score-match/:id', scoreMatch);

export default router;
