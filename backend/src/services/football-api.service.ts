import axios from 'axios';
import type { AxiosInstance } from 'axios';

interface ApiFootballFixture {
  fixture: {
    id: number;
    date: string;
    status: { short: string; long: string; elapsed: number | null };
    venue: { id: number; name: string; city: string };
    referee: string | null;
  };
  league: {
    id: number;
    name: string;
    country: string;
    logo: string;
    round: string;
    season: number;
  };
  teams: {
    home: { id: number; name: string; logo: string; winner: boolean | null };
    away: { id: number; name: string; logo: string; winner: boolean | null };
  };
  goals: { home: number | null; away: number | null };
  score: {
    halftime: { home: number | null; away: number | null };
    fulltime: { home: number | null; away: number | null };
    extratime: { home: number | null; away: number | null };
    penalty: { home: number | null; away: number | null };
  };
}

interface ApiFootballLeague {
  league: { id: number; name: string; type: string; logo: string };
  country: { name: string; code: string; flag: string };
  seasons: Array<{ year: number; start: string; end: string; current: boolean }>;
}

interface ApiFootballEvent {
  time: { elapsed: number; extra: number | null };
  team: { id: number; name: string; logo: string };
  player: { id: number; name: string };
  assist: { id: number | null; name: string | null };
  type: string;
  detail: string;
}

interface ApiFootballStanding {
  rank: number;
  team: { id: number; name: string; logo: string };
  points: number;
  goalsDiff: number;
  group: string;
  form: string;
  status: string;
  description: string | null;
  all: { played: number; win: number; draw: number; lose: number; goals: { for: number; against: number } };
}

interface ApiResponse<T> {
  get: string;
  parameters: Record<string, string>;
  errors: unknown[];
  results: number;
  paging: { current: number; total: number };
  response: T[];
}

const STATUS_MAP: Record<string, string> = {
  TBD: 'scheduled', NS: 'scheduled', '1H': 'live', HT: 'live', '2H': 'live',
  ET: 'live', BT: 'live', P: 'live', SUSP: 'postponed', INT: 'live',
  FT: 'finished', AET: 'finished', PEN: 'finished', PST: 'postponed',
  CANC: 'postponed', ABD: 'postponed', AWD: 'finished', WO: 'finished', LIVE: 'live',
};

export class FootballApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: 'https://v3.football.api-sports.io',
      headers: {
        'x-apisports-key': process.env.FOOTBALL_API_KEY || '',
      },
      timeout: 10000,
    });

    this.client.interceptors.response.use((res) => {
      const remaining = res.headers['x-ratelimit-requests-remaining'];
      if (remaining !== undefined && Number(remaining) < 10) {
        console.warn(`⚠️  API-Football: only ${remaining} requests remaining today`);
      }
      return res;
    });
  }

  async getFixtures(params: {
    league?: number;
    season?: number;
    date?: string;
    team?: number;
    live?: string;
    status?: string;
    from?: string;
    to?: string;
    round?: string;
    timezone?: string;
  }): Promise<ApiFootballFixture[]> {
    const res = await this.client.get<ApiResponse<ApiFootballFixture>>('/fixtures', { params });
    return res.data.response;
  }

  async getFixtureById(fixtureId: number): Promise<ApiFootballFixture | null> {
    const res = await this.client.get<ApiResponse<ApiFootballFixture>>('/fixtures', {
      params: { id: fixtureId },
    });
    return res.data.response[0] || null;
  }

  async getLiveFixtures(leagueId?: number): Promise<ApiFootballFixture[]> {
    const params: Record<string, unknown> = { live: 'all' };
    if (leagueId) params.league = leagueId;
    const res = await this.client.get<ApiResponse<ApiFootballFixture>>('/fixtures', { params });
    return res.data.response;
  }

  async getLeagues(params: {
    id?: number;
    name?: string;
    country?: string;
    season?: number;
    current?: boolean;
    type?: string;
    search?: string;
  } = {}): Promise<ApiFootballLeague[]> {
    const res = await this.client.get<ApiResponse<ApiFootballLeague>>('/leagues', { params });
    return res.data.response;
  }

  async getStandings(leagueId: number, season: number): Promise<ApiFootballStanding[][]> {
    const res = await this.client.get<ApiResponse<{ league: { standings: ApiFootballStanding[][] } }>>('/standings', {
      params: { league: leagueId, season },
    });
    return res.data.response[0]?.league?.standings || [];
  }

  async getFixtureEvents(fixtureId: number): Promise<ApiFootballEvent[]> {
    const res = await this.client.get<ApiResponse<ApiFootballEvent>>('/fixtures/events', {
      params: { fixture: fixtureId },
    });
    return res.data.response;
  }

  async getRounds(leagueId: number, season: number, current?: boolean): Promise<string[]> {
    const params: Record<string, unknown> = { league: leagueId, season };
    if (current) params.current = true;
    const res = await this.client.get<ApiResponse<string>>('/fixtures/rounds', { params });
    return res.data.response;
  }

  async getTeamInfo(teamId: number) {
    const res = await this.client.get('/teams', { params: { id: teamId } });
    return res.data.response[0] || null;
  }

  async getPlayers(leagueId: number, season: number, page = 1) {
    const res = await this.client.get('/players', {
      params: { league: leagueId, season, page },
    });
    return { players: res.data.response, paging: res.data.paging };
  }

  async getTopScorers(leagueId: number, season: number) {
    const res = await this.client.get('/players/topscorers', {
      params: { league: leagueId, season },
    });
    return res.data.response;
  }

  async getPredictions(fixtureId: number) {
    const res = await this.client.get('/predictions', {
      params: { fixture: fixtureId },
    });
    return res.data.response[0] || null;
  }

  async getInjuries(params: { league?: number; season?: number; fixture?: number; team?: number }) {
    const res = await this.client.get('/injuries', { params });
    return res.data.response;
  }

  async getHeadToHead(h2h: string, last?: number) {
    const params: Record<string, unknown> = { h2h };
    if (last) params.last = last;
    const res = await this.client.get('/fixtures/headtohead', { params });
    return res.data.response;
  }

  async checkStatus() {
    const res = await this.client.get('/status');
    return res.data.response;
  }

  /** Convert API-Football fixture status to our DB status */
  static mapStatus(apiStatus: string): 'scheduled' | 'live' | 'finished' | 'postponed' {
    return (STATUS_MAP[apiStatus] as 'scheduled' | 'live' | 'finished' | 'postponed') || 'scheduled';
  }
}

export const footballApiService = new FootballApiService();
