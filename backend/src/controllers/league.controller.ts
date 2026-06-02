import { Response } from 'express';
import { body } from 'express-validator';
import { leagueService } from '../services/league.service';
import { AuthenticatedRequest } from '../middleware/auth';

export const createLeagueValidation = [
  body('name').trim().isLength({ min: 3, max: 100 }),
  body('description').optional().trim().isLength({ max: 500 }),
];

export const joinLeagueValidation = [
  body('inviteCode').trim().isLength({ min: 4, max: 20 }),
];

export async function createLeague(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { name, description } = req.body;
    const league = await leagueService.createLeague(name, description, req.user!.id);
    res.status(201).json({ message: 'League created', league });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create league';
    res.status(400).json({ error: message });
  }
}

export async function joinLeague(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { inviteCode } = req.body;
    const league = await leagueService.joinLeague(inviteCode, req.user!.id);
    res.json({ message: 'Joined league successfully', league });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to join league';
    res.status(400).json({ error: message });
  }
}

export async function leaveLeague(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    await leagueService.leaveLeague(id, req.user!.id);
    res.json({ message: 'Left league successfully' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to leave league';
    res.status(400).json({ error: message });
  }
}

export async function getUserLeagues(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const leagues = await leagueService.getUserLeagues(req.user!.id);
    res.json({ leagues });
  } catch {
    res.status(500).json({ error: 'Failed to fetch leagues' });
  }
}

export async function getLeagueMembers(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const members = await leagueService.getLeagueMembers(id, req.user!.id);
    res.json({ members });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch members';
    res.status(400).json({ error: message });
  }
}

export async function getLeagueById(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const league = await leagueService.getLeagueById(id, req.user!.id);
    if (!league) {
      res.status(404).json({ error: 'League not found' });
      return;
    }
    res.json({ league });
  } catch {
    res.status(500).json({ error: 'Failed to fetch league' });
  }
}
