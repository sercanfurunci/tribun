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

  /** Compute group standings from our own match results (shaped like API-Football standings) */
  async getStandings() {
    const result = await pool.query(
      `SELECT home_team, away_team, home_team_logo, away_team_logo,
              home_score, away_score, status, group_name, kickoff_time
       FROM matches
       WHERE group_name IS NOT NULL
       ORDER BY kickoff_time ASC`
    );

    interface TeamRow {
      name: string; logo: string; group: string;
      played: number; win: number; draw: number; lose: number;
      gf: number; ga: number; points: number; form: string[];
    }
    const teams = new Map<string, TeamRow>();

    const ensure = (name: string, logo: string, group: string): TeamRow => {
      let t = teams.get(name);
      if (!t) {
        t = { name, logo, group, played: 0, win: 0, draw: 0, lose: 0, gf: 0, ga: 0, points: 0, form: [] };
        teams.set(name, t);
      }
      return t;
    };

    for (const m of result.rows) {
      const home = ensure(m.home_team, m.home_team_logo, m.group_name);
      const away = ensure(m.away_team, m.away_team_logo, m.group_name);
      if (m.status !== 'finished' || m.home_score === null || m.away_score === null) continue;

      home.played++; away.played++;
      home.gf += m.home_score; home.ga += m.away_score;
      away.gf += m.away_score; away.ga += m.home_score;

      if (m.home_score > m.away_score) {
        home.win++; home.points += 3; home.form.push('W');
        away.lose++; away.form.push('L');
      } else if (m.home_score < m.away_score) {
        away.win++; away.points += 3; away.form.push('W');
        home.lose++; home.form.push('L');
      } else {
        home.draw++; home.points++; home.form.push('D');
        away.draw++; away.points++; away.form.push('D');
      }
    }

    const groups = new Map<string, TeamRow[]>();
    for (const t of teams.values()) {
      if (!groups.has(t.group)) groups.set(t.group, []);
      groups.get(t.group)!.push(t);
    }

    let teamId = 1;
    return [...groups.keys()].sort().map((g) =>
      groups.get(g)!
        .sort((a, b) =>
          b.points - a.points ||
          (b.gf - b.ga) - (a.gf - a.ga) ||
          b.gf - a.gf ||
          a.name.localeCompare(b.name)
        )
        .map((t, i) => ({
          rank: i + 1,
          team: { id: teamId++, name: t.name, logo: t.logo },
          points: t.points,
          goalsDiff: t.gf - t.ga,
          group: `Group ${g}`,
          form: t.form.slice(-5).join(''),
          description: null,
          all: {
            played: t.played, win: t.win, draw: t.draw, lose: t.lose,
            goals: { for: t.gf, against: t.ga },
          },
        }))
    );
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
