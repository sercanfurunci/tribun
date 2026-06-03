import { pool } from '../db/pool';
import { footballApiService, FootballApiService } from './football-api.service';
import { theSportsDBService } from './thesportsdb.service';
import { predictionService } from './prediction.service';

export interface SyncResult {
  inserted: number;
  updated: number;
  scored: number;
  errors: string[];
}

export class SyncService {
  /**
   * Sync fixtures from API-Football into our matches table.
   * Call this for any league+season combination.
   */
  async syncFixtures(leagueId: number, season: number): Promise<SyncResult> {
    const result: SyncResult = { inserted: 0, updated: 0, scored: 0, errors: [] };

    let fixtures;
    try {
      fixtures = await footballApiService.getFixtures({ league: leagueId, season });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch from API-Football';
      result.errors.push(msg);
      return result;
    }

    for (const f of fixtures) {
      try {
        const status = FootballApiService.mapStatus(f.fixture.status.short);
        const existing = await pool.query(
          'SELECT id, status FROM matches WHERE external_id = $1',
          [f.fixture.id]
        );

        if (existing.rows.length === 0) {
          await pool.query(
            `INSERT INTO matches
               (external_id, home_team, away_team, home_team_logo, away_team_logo,
                kickoff_time, status, home_score, away_score, tournament, match_day,
                external_league_id, external_season, venue, referee,
                home_team_external_id, away_team_external_id)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)`,
            [
              f.fixture.id,
              f.teams.home.name,
              f.teams.away.name,
              f.teams.home.logo,
              f.teams.away.logo,
              f.fixture.date,
              status,
              f.goals.home,
              f.goals.away,
              f.league.name,
              f.league.round || null,
              f.league.id,
              f.league.season,
              f.fixture.venue?.name || null,
              f.fixture.referee || null,
              f.teams.home.id,
              f.teams.away.id,
            ]
          );
          result.inserted++;
        } else {
          const wasFinished = existing.rows[0].status === 'finished';
          await pool.query(
            `UPDATE matches
             SET status = $1, home_score = $2, away_score = $3,
                 home_team_logo = $4, away_team_logo = $5,
                 kickoff_time = $6
             WHERE external_id = $7`,
            [
              status,
              f.goals.home,
              f.goals.away,
              f.teams.home.logo,
              f.teams.away.logo,
              f.fixture.date,
              f.fixture.id,
            ]
          );
          result.updated++;

          if (!wasFinished && status === 'finished' && f.goals.home !== null && f.goals.away !== null) {
            try {
              await predictionService.scoreFinishedMatch(existing.rows[0].id);
              result.scored++;
            } catch (scoreErr) {
              result.errors.push(`Scoring failed for match ${existing.rows[0].id}: ${scoreErr}`);
            }
          }
        }
      } catch (err) {
        result.errors.push(`Fixture ${f.fixture.id}: ${err instanceof Error ? err.message : err}`);
      }
    }

    return result;
  }

  /** Sync only live fixtures — lightweight, call frequently */
  async syncLive(leagueId?: number): Promise<SyncResult> {
    const result: SyncResult = { inserted: 0, updated: 0, scored: 0, errors: [] };

    let fixtures;
    try {
      fixtures = await footballApiService.getLiveFixtures(leagueId);
    } catch (err) {
      result.errors.push(err instanceof Error ? err.message : 'API error');
      return result;
    }

    for (const f of fixtures) {
      try {
        const status = FootballApiService.mapStatus(f.fixture.status.short);
        await pool.query(
          `UPDATE matches
           SET status = $1, home_score = $2, away_score = $3
           WHERE external_id = $4`,
          [status, f.goals.home ?? 0, f.goals.away ?? 0, f.fixture.id]
        );
        result.updated++;
      } catch (err) {
        result.errors.push(`Live update ${f.fixture.id}: ${err instanceof Error ? err.message : err}`);
      }
    }

    return result;
  }

  /** Score all finished matches that haven't been scored yet */
  async scoreAllPending(): Promise<{ scored: number; errors: string[] }> {
    const errors: string[] = [];
    const pending = await pool.query(
      `SELECT id FROM matches
       WHERE status = 'finished'
         AND home_score IS NOT NULL
         AND away_score IS NOT NULL
         AND id IN (
           SELECT DISTINCT match_id FROM predictions WHERE points_awarded = 0
         )`
    );

    let scored = 0;
    for (const row of pending.rows) {
      try {
        await predictionService.scoreFinishedMatch(row.id);
        scored++;
      } catch (err) {
        errors.push(`${row.id}: ${err instanceof Error ? err.message : err}`);
      }
    }
    return { scored, errors };
  }

  /** Sync WC 2026 fixtures from TheSportsDB (free, no key required) */
  async syncFromSportsDB(leagueId: string, season: string): Promise<SyncResult> {
    const result: SyncResult = { inserted: 0, updated: 0, scored: 0, errors: [] };

    let events;
    try {
      events = await theSportsDBService.getSeasonEvents(leagueId, season);
    } catch (err) {
      result.errors.push(err instanceof Error ? err.message : 'TheSportsDB fetch failed');
      return result;
    }

    for (const e of events) {
      try {
        const status = theSportsDBService.mapStatus(e.strStatus, e.strPostponed);
        const homeScore = e.intHomeScore !== null ? parseInt(e.intHomeScore) : null;
        const awayScore = e.intAwayScore !== null ? parseInt(e.intAwayScore) : null;
        const kickoff = new Date(e.strTimestamp + (e.strTimestamp.endsWith('Z') ? '' : 'Z'));

        const existing = await pool.query(
          'SELECT id, status FROM matches WHERE external_id = $1',
          [e.idEvent]
        );

        if (existing.rows.length === 0) {
          await pool.query(
            `INSERT INTO matches
               (external_id, home_team, away_team, home_team_logo, away_team_logo,
                kickoff_time, status, home_score, away_score, tournament, match_day,
                external_league_id, external_season, venue, referee)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`,
            [
              e.idEvent,
              e.strHomeTeam,
              e.strAwayTeam,
              e.strHomeTeamBadge,
              e.strAwayTeamBadge,
              kickoff.toISOString(),
              status,
              homeScore,
              awayScore,
              e.strLeague,
              e.intRound ? `Round ${e.intRound}` : null,
              e.idLeague,
              e.strSeason,
              e.strVenue || null,
              null,
            ]
          );
          result.inserted++;
        } else {
          const wasFinished = existing.rows[0].status === 'finished';
          await pool.query(
            `UPDATE matches
             SET status = $1, home_score = $2, away_score = $3,
                 home_team_logo = $4, away_team_logo = $5, kickoff_time = $6
             WHERE external_id = $7`,
            [status, homeScore, awayScore, e.strHomeTeamBadge, e.strAwayTeamBadge, kickoff.toISOString(), e.idEvent]
          );
          result.updated++;

          if (!wasFinished && status === 'finished' && homeScore !== null && awayScore !== null) {
            try {
              await predictionService.scoreFinishedMatch(existing.rows[0].id);
              result.scored++;
            } catch (scoreErr) {
              result.errors.push(`Scoring failed for match ${existing.rows[0].id}: ${scoreErr}`);
            }
          }
        }
      } catch (err) {
        result.errors.push(`Event ${e.idEvent}: ${err instanceof Error ? err.message : err}`);
      }
    }

    return result;
  }

  /** Delete all matches for a given source leagueId + season */
  async clearFixtures(externalLeagueId: string, externalSeason: string): Promise<{ deleted: number }> {
    const res = await pool.query(
      'DELETE FROM matches WHERE external_league_id = $1 AND external_season::text = $2',
      [externalLeagueId, externalSeason]
    );
    return { deleted: res.rowCount ?? 0 };
  }

  /** Delete matches by internal UUID list */
  async clearFixturesByIds(ids: string[]): Promise<{ deleted: number }> {
    const res = await pool.query(
      'DELETE FROM matches WHERE id = ANY($1::uuid[])',
      [ids]
    );
    return { deleted: res.rowCount ?? 0 };
  }
}

export const syncService = new SyncService();

