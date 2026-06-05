import { pool } from '../db/pool';
import { Prediction } from '../types';
import { calculatePoints } from '../utils/scoring';

export class PredictionService {
  async upsertPrediction(
    userId: string,
    matchId: string,
    leagueId: string,
    predictedHome: number,
    predictedAway: number
  ): Promise<Prediction> {
    const matchResult = await pool.query(
      'SELECT kickoff_time, status FROM matches WHERE id = $1',
      [matchId]
    );
    if (matchResult.rows.length === 0) throw new Error('Match not found');

    const match = matchResult.rows[0];
    if (match.status !== 'scheduled') throw new Error('Match has already started or finished');
    if (new Date(match.kickoff_time) <= new Date()) throw new Error('Predictions are locked for this match');

    const memberCheck = await pool.query(
      'SELECT id FROM league_members WHERE league_id = $1 AND user_id = $2',
      [leagueId, userId]
    );
    if (memberCheck.rows.length === 0) throw new Error('Not a member of this league');

    const result = await pool.query<Prediction>(
      `INSERT INTO predictions (user_id, match_id, league_id, predicted_home_score, predicted_away_score)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id, match_id, league_id) DO UPDATE
       SET predicted_home_score = EXCLUDED.predicted_home_score,
           predicted_away_score = EXCLUDED.predicted_away_score,
           updated_at = NOW()
       RETURNING *`,
      [userId, matchId, leagueId, predictedHome, predictedAway]
    );
    return result.rows[0];
  }

  async getUserPredictions(userId: string, leagueId?: string) {
    let query = `SELECT p.*, m.home_team, m.away_team, m.kickoff_time, m.status, m.home_score, m.away_score, m.tournament, l.name AS league_name
       FROM predictions p
       JOIN matches m ON p.match_id = m.id
       JOIN leagues l ON p.league_id = l.id
       WHERE p.user_id = $1`;
    const params: unknown[] = [userId];
    if (leagueId) {
      query += ' AND p.league_id = $2';
      params.push(leagueId);
    }
    query += ' ORDER BY m.kickoff_time DESC';
    const result = await pool.query(query, params);
    return result.rows;
  }

  async getMatchPredictions(matchId: string, leagueId: string) {
    const result = await pool.query(
      `SELECT p.*, u.username, u.avatar_url
       FROM predictions p
       JOIN users u ON p.user_id = u.id
       WHERE p.match_id = $1 AND p.league_id = $2
       ORDER BY u.username ASC`,
      [matchId, leagueId]
    );
    return result.rows;
  }

  async scoreFinishedMatch(matchId: string): Promise<void> {
    const matchResult = await pool.query(
      'SELECT home_score, away_score, status FROM matches WHERE id = $1',
      [matchId]
    );
    if (matchResult.rows.length === 0) throw new Error('Match not found');

    const match = matchResult.rows[0];
    if (match.status !== 'finished') throw new Error('Match is not finished');
    if (match.home_score === null || match.away_score === null) throw new Error('Match scores not set');

    const predictions = await pool.query(
      'SELECT * FROM predictions WHERE match_id = $1',
      [matchId]
    );

    for (const prediction of predictions.rows) {
      const points = calculatePoints(
        prediction.predicted_home_score,
        prediction.predicted_away_score,
        match.home_score,
        match.away_score
      );
      await pool.query(
        'UPDATE predictions SET points_awarded = $1 WHERE id = $2',
        [points, prediction.id]
      );
    }
  }

  async getUserStats(userId: string, leagueId?: string) {
    let query = `
      SELECT
        COUNT(*)::int AS total_predictions,
        COALESCE(SUM(points_awarded), 0)::int AS total_points,
        COUNT(CASE WHEN points_awarded = 3 THEN 1 END)::int AS exact_scores,
        COUNT(CASE WHEN points_awarded >= 1 THEN 1 END)::int AS correct_outcomes
      FROM predictions
      WHERE user_id = $1
    `;
    const params: unknown[] = [userId];

    if (leagueId) {
      query += ' AND league_id = $2';
      params.push(leagueId);
    }

    const result = await pool.query(query, params);
    return result.rows[0];
  }
}

export const predictionService = new PredictionService();
