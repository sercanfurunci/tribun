import { Response } from 'express';
import { leaderboardService } from '../services/leaderboard.service';
import { AuthenticatedRequest } from '../middleware/auth';

export async function getLeagueLeaderboard(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { leagueId } = req.params;
    const leaderboard = await leaderboardService.getLeagueLeaderboard(leagueId);
    res.json({ leaderboard });
  } catch {
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
}
