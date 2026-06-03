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

export interface SportsDBTeam {
  idTeam: string;
  strTeam: string;
  strTeamShort: string;
  strCountry: string;
  strStadium: string | null;
  intStadiumCapacity: string | null;
  strColour1: string | null;
  strColour2: string | null;
  strColour3: string | null;
  strDescriptionEN: string | null;
  strDescriptionTR: string | null;
  strBadge: string | null;
  strLogo: string | null;
  strFanart1: string | null;
  strFanart2: string | null;
  strBanner: string | null;
  strWebsite: string | null;
  strTwitter: string | null;
  strInstagram: string | null;
  idAPIfootball: string | null;
  intFormedYear: string | null;
  strLeague: string | null;
  strLocation: string | null;
}

export interface SportsDBPlayer {
  idPlayer: string;
  strPlayer: string;
  strPosition: string | null;
  strNationality: string | null;
  strNumber: string | null;
  strThumb: string | null;
  strCutout: string | null;
}

export interface SportsDBTeamEvent {
  idEvent: string;
  strTimestamp: string;
  strHomeTeam: string;
  strAwayTeam: string;
  intHomeScore: string | null;
  intAwayScore: string | null;
  strHomeTeamBadge: string;
  strAwayTeamBadge: string;
  strLeague: string;
  strLeagueBadge: string;
  strStatus: string;
  strPostponed: string;
  idHomeTeam: string;
  idAwayTeam: string;
  strVenue: string | null;
  dateEvent: string | null;
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

  async searchTeam(name: string): Promise<SportsDBTeam | null> {
    const res = await client.get<{ teams: SportsDBTeam[] | null }>(
      `/searchteams.php?t=${encodeURIComponent(name)}`
    );
    return res.data.teams?.[0] ?? null;
  }

  async getTeamById(id: string): Promise<SportsDBTeam | null> {
    const res = await client.get<{ teams: SportsDBTeam[] | null }>(
      `/lookupteam.php?id=${id}`
    );
    return res.data.teams?.[0] ?? null;
  }

  async getTeamPlayers(teamId: string): Promise<SportsDBPlayer[]> {
    const res = await client.get<{ player: SportsDBPlayer[] | null }>(
      `/lookup_all_players.php?id=${teamId}`
    );
    return res.data.player ?? [];
  }

  async getTeamNextEvents(teamId: string): Promise<SportsDBTeamEvent[]> {
    const res = await client.get<{ events: SportsDBTeamEvent[] | null }>(
      `/eventsnext.php?id=${teamId}`
    );
    return res.data.events ?? [];
  }

  async getTeamLastEvents(teamId: string): Promise<SportsDBTeamEvent[]> {
    const res = await client.get<{ results: SportsDBTeamEvent[] | null }>(
      `/eventslast.php?id=${teamId}`
    );
    return res.data.results ?? [];
  }

  mapStatus(strStatus: string, strPostponed: string): 'scheduled' | 'live' | 'finished' | 'postponed' {
    if (strPostponed === 'yes') return 'postponed';
    return STATUS_MAP[strStatus] ?? 'scheduled';
  }
}

export const theSportsDBService = new TheSportsDBService();
