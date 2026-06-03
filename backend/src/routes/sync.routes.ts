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
  getFixtureInjuries,
  getHeadToHead,
  getFixtureStatistics,
  getTopScorers,
  scoreMatch,
  syncFromSportsDB,
  clearFixtures,
  searchTeam,
  getTeamById,
  getTeamPlayers,
  getTeamNextEvents,
  getTeamLastEvents,
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
router.get('/injuries/:fixtureId', getFixtureInjuries);
router.get('/h2h', getHeadToHead);
router.get('/statistics/:fixtureId', getFixtureStatistics);
router.get('/team/search', searchTeam);
router.get('/team/:id/players', getTeamPlayers);
router.get('/team/:id/next', getTeamNextEvents);
router.get('/team/:id/last', getTeamLastEvents);
router.get('/team/:id', getTeamById);
router.get('/topscorers', getTopScorers);

router.post('/fixtures', syncFixtures);
router.post('/fixtures/sportsdb', syncFromSportsDB);
router.delete('/fixtures', clearFixtures);
router.post('/live', syncLive);
router.post('/score', scoreMatches);
router.post('/score-match/:id', scoreMatch);

export default router;
