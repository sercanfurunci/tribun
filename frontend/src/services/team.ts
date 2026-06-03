import api from './api';

export interface SportsDBTeam {
  idTeam: string;
  strTeam: string;
  strTeamShort: string;
  strCountry: string;
  strStadium: string | null;
  intStadiumCapacity: string | null;
  strColour1: string | null;
  strColour2: string | null;
  strDescriptionEN: string | null;
  strBadge: string | null;
  strLogo: string | null;
  strFanart1: string | null;
  strBanner: string | null;
  strWebsite: string | null;
  strTwitter: string | null;
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

export const teamApi = {
  search: (name: string) =>
    api.get<{ team: SportsDBTeam | null }>(`/sync/team/search?name=${encodeURIComponent(name)}`),

  getById: (id: string) =>
    api.get<{ team: SportsDBTeam | null }>(`/sync/team/${id}`),

  getPlayers: (id: string) =>
    api.get<{ players: SportsDBPlayer[] }>(`/sync/team/${id}/players`),

  getNextEvents: (id: string) =>
    api.get<{ events: SportsDBTeamEvent[] }>(`/sync/team/${id}/next`),

  getLastEvents: (id: string) =>
    api.get<{ events: SportsDBTeamEvent[] }>(`/sync/team/${id}/last`),
};
