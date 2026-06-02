import { pool } from '../db/pool';
import { League } from '../types';

function generateInviteCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export class LeagueService {
  async createLeague(name: string, description: string | undefined, ownerId: string): Promise<League> {
    let invite_code = generateInviteCode();
    let attempts = 0;
    while (attempts < 5) {
      const exists = await pool.query('SELECT id FROM leagues WHERE invite_code = $1', [invite_code]);
      if (exists.rows.length === 0) break;
      invite_code = generateInviteCode();
      attempts++;
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const result = await client.query<League>(
        `INSERT INTO leagues (name, description, invite_code, owner_id)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [name, description || null, invite_code, ownerId]
      );
      const league = result.rows[0];
      await client.query(
        'INSERT INTO league_members (league_id, user_id) VALUES ($1, $2)',
        [league.id, ownerId]
      );
      await client.query('COMMIT');
      return league;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async joinLeague(inviteCode: string, userId: string): Promise<League> {
    const leagueResult = await pool.query<League>(
      'SELECT * FROM leagues WHERE invite_code = $1',
      [inviteCode.toUpperCase()]
    );
    if (leagueResult.rows.length === 0) throw new Error('League not found');

    const league = leagueResult.rows[0];
    const memberCheck = await pool.query(
      'SELECT id FROM league_members WHERE league_id = $1 AND user_id = $2',
      [league.id, userId]
    );
    if (memberCheck.rows.length > 0) throw new Error('Already a member of this league');

    await pool.query(
      'INSERT INTO league_members (league_id, user_id) VALUES ($1, $2)',
      [league.id, userId]
    );
    return league;
  }

  async leaveLeague(leagueId: string, userId: string): Promise<void> {
    const league = await pool.query('SELECT owner_id FROM leagues WHERE id = $1', [leagueId]);
    if (league.rows.length === 0) throw new Error('League not found');
    if (league.rows[0].owner_id === userId) throw new Error('Owner cannot leave the league');

    const result = await pool.query(
      'DELETE FROM league_members WHERE league_id = $1 AND user_id = $2',
      [leagueId, userId]
    );
    if (result.rowCount === 0) throw new Error('Not a member of this league');
  }

  async getUserLeagues(userId: string) {
    const result = await pool.query(
      `SELECT l.*,
        COUNT(lm2.id)::int AS member_count,
        (l.owner_id = $1) AS is_owner
       FROM leagues l
       JOIN league_members lm ON l.id = lm.league_id
       LEFT JOIN league_members lm2 ON l.id = lm2.league_id
       WHERE lm.user_id = $1
       GROUP BY l.id
       ORDER BY l.created_at DESC`,
      [userId]
    );
    return result.rows;
  }

  async getLeagueMembers(leagueId: string, requestingUserId: string) {
    const membership = await pool.query(
      'SELECT id FROM league_members WHERE league_id = $1 AND user_id = $2',
      [leagueId, requestingUserId]
    );
    if (membership.rows.length === 0) throw new Error('Not a member of this league');

    const result = await pool.query(
      `SELECT u.id, u.username, u.avatar_url, lm.joined_at
       FROM league_members lm
       JOIN users u ON lm.user_id = u.id
       WHERE lm.league_id = $1
       ORDER BY lm.joined_at ASC`,
      [leagueId]
    );
    return result.rows;
  }

  async getLeagueById(leagueId: string, userId: string) {
    const result = await pool.query(
      `SELECT l.*,
        COUNT(lm.id)::int AS member_count,
        (l.owner_id = $2) AS is_owner,
        EXISTS(SELECT 1 FROM league_members WHERE league_id = l.id AND user_id = $2) AS is_member
       FROM leagues l
       LEFT JOIN league_members lm ON l.id = lm.league_id
       WHERE l.id = $1
       GROUP BY l.id`,
      [leagueId, userId]
    );
    return result.rows[0] || null;
  }
}

export const leagueService = new LeagueService();
