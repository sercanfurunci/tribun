import { Response } from 'express';
import { body } from 'express-validator';
import { predictionService } from '../services/prediction.service';
import { AuthenticatedRequest } from '../middleware/auth';

export const predictionValidation = [
  body('matchId').isUUID(),
  body('leagueId').isUUID(),
  body('predictedHomeScore').isInt({ min: 0, max: 99 }),
  body('predictedAwayScore').isInt({ min: 0, max: 99 }),
];

export async function upsertPrediction(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { matchId, leagueId, predictedHomeScore, predictedAwayScore } = req.body;
    const prediction = await predictionService.upsertPrediction(
      req.user!.id,
      matchId,
      leagueId,
      predictedHomeScore,
      predictedAwayScore
    );
    res.json({ message: 'Prediction saved', prediction });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to save prediction';
    res.status(400).json({ error: message });
  }
}

export async function getUserPredictions(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { leagueId } = req.query;
    if (!leagueId) {
      res.status(400).json({ error: 'leagueId is required' });
      return;
    }
    const predictions = await predictionService.getUserPredictions(req.user!.id, leagueId as string);
    res.json({ predictions });
  } catch {
    res.status(500).json({ error: 'Failed to fetch predictions' });
  }
}

export async function getMatchPredictions(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { matchId } = req.params;
    const { leagueId } = req.query;
    if (!leagueId) {
      res.status(400).json({ error: 'leagueId is required' });
      return;
    }
    const predictions = await predictionService.getMatchPredictions(matchId, leagueId as string);
    res.json({ predictions });
  } catch {
    res.status(500).json({ error: 'Failed to fetch predictions' });
  }
}

export async function getUserStats(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { leagueId } = req.query;
    const stats = await predictionService.getUserStats(req.user!.id, leagueId as string);
    res.json({ stats });
  } catch {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
}
