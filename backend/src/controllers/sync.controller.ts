import { Request, Response } from 'express';
import { syncService } from '../services/sync.service';
import { footballApiService } from '../services/football-api.service';
import { predictionService } from '../services/prediction.service';

/** POST /api/sync/fixtures — trigger a full fixture sync for a league+season */
export async function syncFixtures(req: Request, res: Response): Promise<void> {
  const { leagueId, season } = req.body;

  if (!leagueId || !season) {
    res.status(400).json({ error: 'leagueId and season are required' });
    return;
  }

  try {
    const result = await syncService.syncFixtures(Number(leagueId), Number(season));
    res.json({
      message: 'Fixtures synced',
      ...result,
    });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Sync failed' });
  }
}

/** POST /api/sync/live — sync all currently live fixtures */
export async function syncLive(req: Request, res: Response): Promise<void> {
  const { leagueId } = req.body;
  try {
    const result = await syncService.syncLive(leagueId ? Number(leagueId) : undefined);
    res.json({ message: 'Live fixtures synced', ...result });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Sync failed' });
  }
}

/** POST /api/sync/score — score all pending finished matches */
export async function scoreMatches(_req: Request, res: Response): Promise<void> {
  try {
    const result = await syncService.scoreAllPending();
    res.json({ message: 'Scoring complete', ...result });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Scoring failed' });
  }
}

/** GET /api/sync/leagues — search available leagues from API-Football */
export async function searchLeagues(req: Request, res: Response): Promise<void> {
  const { search, country, season, current } = req.query;
  try {
    const leagues = await footballApiService.getLeagues({
      search: search as string,
      country: country as string,
      season: season ? Number(season) : undefined,
      current: current === 'true' ? true : undefined,
    });
    res.json({ leagues });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to fetch leagues' });
  }
}

/** GET /api/sync/status — check API-Football quota */
export async function apiStatus(_req: Request, res: Response): Promise<void> {
  try {
    const status = await footballApiService.checkStatus();
    res.json({ status });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to check status' });
  }
}

/** GET /api/sync/rounds — get rounds for a league+season */
export async function getRounds(req: Request, res: Response): Promise<void> {
  const { leagueId, season, current } = req.query;
  if (!leagueId || !season) {
    res.status(400).json({ error: 'leagueId and season are required' });
    return;
  }
  try {
    const rounds = await footballApiService.getRounds(
      Number(leagueId),
      Number(season),
      current === 'true'
    );
    res.json({ rounds });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to fetch rounds' });
  }
}

/** GET /api/sync/standings — get live standings from API-Football */
export async function getStandings(req: Request, res: Response): Promise<void> {
  const { leagueId, season } = req.query;
  if (!leagueId || !season) {
    res.status(400).json({ error: 'leagueId and season are required' });
    return;
  }
  try {
    const standings = await footballApiService.getStandings(Number(leagueId), Number(season));
    res.json({ standings });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to fetch standings' });
  }
}

/** GET /api/sync/events/:fixtureId — get match events (goals, cards) */
export async function getFixtureEvents(req: Request, res: Response): Promise<void> {
  const { fixtureId } = req.params;
  try {
    const events = await footballApiService.getFixtureEvents(Number(fixtureId));
    res.json({ events });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to fetch events' });
  }
}

/** GET /api/sync/predictions/:fixtureId — get AI predictions for a fixture */
export async function getApiPrediction(req: Request, res: Response): Promise<void> {
  const { fixtureId } = req.params;
  try {
    const prediction = await footballApiService.getPredictions(Number(fixtureId));
    res.json({ prediction });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to fetch prediction' });
  }
}

/** GET /api/sync/topscorers — get top scorers */
export async function getTopScorers(req: Request, res: Response): Promise<void> {
  const { leagueId, season } = req.query;
  if (!leagueId || !season) {
    res.status(400).json({ error: 'leagueId and season are required' });
    return;
  }
  try {
    const scorers = await footballApiService.getTopScorers(Number(leagueId), Number(season));
    res.json({ scorers });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to fetch top scorers' });
  }
}

/** POST /api/sync/score-match/:id — manually score a specific match */
export async function scoreMatch(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  try {
    await predictionService.scoreFinishedMatch(id);
    res.json({ message: 'Match scored successfully' });
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Scoring failed' });
  }
}
