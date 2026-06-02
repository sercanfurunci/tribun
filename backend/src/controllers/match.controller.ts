import { Request, Response } from 'express';
import { matchService } from '../services/match.service';

export async function getUpcoming(_req: Request, res: Response): Promise<void> {
  try {
    const matches = await matchService.getUpcoming();
    res.json({ matches });
  } catch {
    res.status(500).json({ error: 'Failed to fetch matches' });
  }
}

export async function getFinished(req: Request, res: Response): Promise<void> {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;
    const matches = await matchService.getFinished(limit, offset);
    res.json({ matches });
  } catch {
    res.status(500).json({ error: 'Failed to fetch matches' });
  }
}

export async function getLive(_req: Request, res: Response): Promise<void> {
  try {
    const matches = await matchService.getLive();
    res.json({ matches });
  } catch {
    res.status(500).json({ error: 'Failed to fetch live matches' });
  }
}

export async function getMatchById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const match = await matchService.getById(id);
    if (!match) {
      res.status(404).json({ error: 'Match not found' });
      return;
    }
    res.json({ match });
  } catch {
    res.status(500).json({ error: 'Failed to fetch match' });
  }
}

export async function getAllMatches(req: Request, res: Response): Promise<void> {
  try {
    const { status, tournament } = req.query;
    const matches = await matchService.getAll(status as string, tournament as string);
    res.json({ matches });
  } catch {
    res.status(500).json({ error: 'Failed to fetch matches' });
  }
}
