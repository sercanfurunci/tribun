import { pool } from './pool';

const matches = [
  {
    home_team: 'Brazil',
    away_team: 'Argentina',
    home_team_logo: 'https://flagcdn.com/br.svg',
    away_team_logo: 'https://flagcdn.com/ar.svg',
    kickoff_time: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    tournament: 'FIFA World Cup 2026',
    match_day: 1,
  },
  {
    home_team: 'France',
    away_team: 'Germany',
    home_team_logo: 'https://flagcdn.com/fr.svg',
    away_team_logo: 'https://flagcdn.com/de.svg',
    kickoff_time: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    tournament: 'FIFA World Cup 2026',
    match_day: 1,
  },
  {
    home_team: 'Spain',
    away_team: 'Portugal',
    home_team_logo: 'https://flagcdn.com/es.svg',
    away_team_logo: 'https://flagcdn.com/pt.svg',
    kickoff_time: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    tournament: 'FIFA World Cup 2026',
    match_day: 1,
  },
  {
    home_team: 'England',
    away_team: 'Netherlands',
    home_team_logo: 'https://flagcdn.com/gb-eng.svg',
    away_team_logo: 'https://flagcdn.com/nl.svg',
    kickoff_time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'finished',
    home_score: 2,
    away_score: 1,
    tournament: 'FIFA World Cup 2026',
    match_day: 1,
  },
  {
    home_team: 'Italy',
    away_team: 'Belgium',
    home_team_logo: 'https://flagcdn.com/it.svg',
    away_team_logo: 'https://flagcdn.com/be.svg',
    kickoff_time: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'finished',
    home_score: 0,
    away_score: 0,
    tournament: 'FIFA World Cup 2026',
    match_day: 1,
  },
];

async function seed() {
  const client = await pool.connect();
  try {
    for (const match of matches) {
      await client.query(
        `INSERT INTO matches (home_team, away_team, home_team_logo, away_team_logo, kickoff_time, status, home_score, away_score, tournament, match_day)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT DO NOTHING`,
        [
          match.home_team,
          match.away_team,
          match.home_team_logo,
          match.away_team_logo,
          match.kickoff_time,
          match.status || 'scheduled',
          match.home_score ?? null,
          match.away_score ?? null,
          match.tournament,
          match.match_day,
        ]
      );
    }
    console.log('✅ Seed data inserted successfully');
  } catch (err) {
    console.error('❌ Seed failed:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
