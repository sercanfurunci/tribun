import api from './api';

export interface FixtureEvent {
  time: { elapsed: number; extra: number | null };
  team: { id: number; name: string; logo: string };
  player: { id: number; name: string };
  assist: { id: number | null; name: string | null };
  type: string;
  detail: string;
}

export interface Standing {
  rank: number;
  team: { id: number; name: string; logo: string };
  points: number;
  goalsDiff: number;
  group: string;
  form: string;
  description: string | null;
  all: { played: number; win: number; draw: number; lose: number; goals: { for: number; against: number } };
}

export interface ApiPrediction {
  winner: { id: number; name: string; comment: string } | null;
  win_or_draw: boolean;
  under_over: string | null;
  goals: { home: string | null; away: string | null };
  advice: string;
  percent: { home: string; draw: string; away: string };
}

export interface InjuryEntry {
  player: { id: number; name: string; photo: string; type: string; reason: string };
  team: { id: number; name: string; logo: string };
  fixture: { id: number; timezone: string; date: string };
  league: { id: number; name: string; season: number };
}

export interface H2HFixture {
  fixture: { id: number; date: string; status: { short: string } };
  league: { id: number; name: string; season: number };
  teams: {
    home: { id: number; name: string; logo: string; winner: boolean | null };
    away: { id: number; name: string; logo: string; winner: boolean | null };
  };
  goals: { home: number | null; away: number | null };
}

export interface TopScorer {
  player: { id: number; name: string; photo: string; nationality: string; age: number };
  statistics: Array<{
    team: { id: number; name: string; logo: string };
    goals: { total: number | null; assists: number | null };
    games: { appearences: number | null };
  }>;
}

export const footballApi = {
  getFixtureEvents: (fixtureId: number) =>
    api.get<{ events: FixtureEvent[] }>(`/sync/events/${fixtureId}`),

  getApiPrediction: (fixtureId: number) =>
    api.get<{ prediction: { predictions: ApiPrediction } | null }>(`/sync/predictions/${fixtureId}`),

  getStandings: (leagueId: number, season: number) =>
    api.get<{ standings: Standing[][] }>(`/sync/standings?leagueId=${leagueId}&season=${season}`),

  getFixtureInjuries: (fixtureId: number) =>
    api.get<{ injuries: InjuryEntry[] }>(`/sync/injuries/${fixtureId}`),

  getH2H: (homeTeamId: number, awayTeamId: number, last = 5) =>
    api.get<{ h2h: H2HFixture[] }>(`/sync/h2h?teams=${homeTeamId}-${awayTeamId}&last=${last}`),

  getTopScorers: (leagueId: number, season: number) =>
    api.get<{ scorers: TopScorer[] }>(`/sync/topscorers?leagueId=${leagueId}&season=${season}`),
};
