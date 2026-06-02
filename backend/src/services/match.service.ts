import { pool } from '../db/pool';
import { Match } from '../types';

export class MatchService {
  async getUpcoming(limit = 20) {
    const result = await pool.query<Match>(
      `SELECT * FROM matches
       WHERE kickoff_time > NOW() AND status = 'scheduled'
       ORDER BY kickoff_time ASC
       LIMIT $1`,
      [limit]
    );
    return result.rows;
  }

  async getFinished(limit = 20, offset = 0) {
    const result = await pool.query<Match>(
      `SELECT * FROM matches
       WHERE status = 'finished'
       ORDER BY kickoff_time DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    return result.rows;
  }

  async getLive() {
    const result = await pool.query<Match>(
      `SELECT * FROM matches WHERE status = 'live' ORDER BY kickoff_time ASC`
    );
    return result.rows;
  }

  async getById(id: string): Promise<Match | null> {
    const result = await pool.query<Match>('SELECT * FROM matches WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  async getAll(status?: string, tournament?: string) {
    let query = 'SELECT * FROM matches WHERE 1=1';
    const params: unknown[] = [];
    let paramIdx = 1;

    if (status) {
      query += ` AND status = $${paramIdx++}`;
      params.push(status);
    }
    if (tournament) {
      query += ` AND tournament = $${paramIdx++}`;
      params.push(tournament);
    }

    query += ' ORDER BY kickoff_time ASC';
    const result = await pool.query<Match>(query, params);
    return result.rows;
  }

  async create(data: Omit<Match, 'id' | 'created_at'>) {
    const result = await pool.query<Match>(
      `INSERT INTO matches (home_team, away_team, home_team_logo, away_team_logo, kickoff_time, status, home_score, away_score, tournament, match_day)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        data.home_team, data.away_team, data.home_team_logo, data.away_team_logo,
        data.kickoff_time, data.status || 'scheduled', data.home_score, data.away_score,
        data.tournament, data.match_day,
      ]
    );
    return result.rows[0];
  }

  async updateResult(id: string, homeScore: number, awayScore: number) {
    const result = await pool.query<Match>(
      `UPDATE matches SET home_score = $1, away_score = $2, status = 'finished'
       WHERE id = $3 RETURNING *`,
      [homeScore, awayScore, id]
    );
    return result.rows[0];
  }
}

export const matchService = new MatchService();
