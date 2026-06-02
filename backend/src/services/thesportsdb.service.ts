import axios from 'axios';

interface SportsDBEvent {
  idEvent: string;
  strSeason: string;
  idLeague: string;
  strLeague: string;
  strHomeTeam: string;
  strAwayTeam: string;
  idHomeTeam: string;
  idAwayTeam: string;
  intRound: string | null;
  intHomeScore: string | null;
  intAwayScore: string | null;
  strTimestamp: string;
  strHomeTeamBadge: string;
  strAwayTeamBadge: string;
  strVenue: string | null;
  strPostponed: string;
  strStatus: string;
}

const STATUS_MAP: Record<string, 'scheduled' | 'live' | 'finished' | 'postponed'> = {
  NS: 'scheduled',
  '1H': 'live',
  HT: 'live',
  '2H': 'live',
  ET: 'live',
  P: 'live',
  FT: 'finished',
  AET: 'finished',
  PEN: 'finished',
  PST: 'postponed',
  CANC: 'postponed',
  LIVE: 'live',
};

const client = axios.create({
  baseURL: 'https://www.thesportsdb.com/api/v1/json/3',
  timeout: 15000,
});

export class TheSportsDBService {
  async getSeasonEvents(leagueId: string, season: string): Promise<SportsDBEvent[]> {
    const res = await client.get<{ events: SportsDBEvent[] | null }>(
      `/eventsseason.php?id=${leagueId}&s=${season}`
    );
    return res.data.events ?? [];
  }

  mapStatus(strStatus: string, strPostponed: string): 'scheduled' | 'live' | 'finished' | 'postponed' {
    if (strPostponed === 'yes') return 'postponed';
    return STATUS_MAP[strStatus] ?? 'scheduled';
  }
}

export const theSportsDBService = new TheSportsDBService();
