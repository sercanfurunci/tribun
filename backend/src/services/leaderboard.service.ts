import { pool } from '../db/pool';
import { LeaderboardEntry } from '../types';

export class LeaderboardService {
  async getLeagueLeaderboard(leagueId: string): Promise<LeaderboardEntry[]> {
    const result = await pool.query(
      `SELECT
        u.id AS user_id,
        u.username,
        u.avatar_url,
        COALESCE(SUM(p.points_awarded), 0)::int AS total_points,
        COUNT(p.id)::int AS predictions_count,
        COUNT(CASE WHEN p.points_awarded = 3 THEN 1 END)::int AS exact_scores,
        COUNT(CASE WHEN p.points_awarded >= 1 THEN 1 END)::int AS correct_outcomes
       FROM league_members lm
       JOIN users u ON lm.user_id = u.id
       LEFT JOIN predictions p ON p.user_id = u.id AND p.league_id = $1
       WHERE lm.league_id = $1
       GROUP BY u.id, u.username, u.avatar_url
       ORDER BY total_points DESC, exact_scores DESC, correct_outcomes DESC`,
      [leagueId]
    );

    return result.rows.map((row, index) => ({
      ...row,
      position: index + 1,
    }));
  }
}

export const leaderboardService = new LeaderboardService();
