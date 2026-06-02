import { Router } from 'express';
import { getUpcoming, getFinished, getLive, getMatchById, getAllMatches } from '../controllers/match.controller';

const router = Router();

router.get('/', getAllMatches);
router.get('/upcoming', getUpcoming);
router.get('/finished', getFinished);
router.get('/live', getLive);
router.get('/:id', getMatchById);

export default router;
