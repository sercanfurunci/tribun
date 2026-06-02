import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  upsertPrediction, getUserPredictions, getMatchPredictions,
  getUserStats, predictionValidation,
} from '../controllers/prediction.controller';

const router = Router();

router.use(authenticate);

router.post('/', predictionValidation, validate, upsertPrediction);
router.get('/mine', getUserPredictions);
router.get('/stats', getUserStats);
router.get('/match/:matchId', getMatchPredictions);

export default router;
