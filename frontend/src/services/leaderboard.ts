import api from './api';
import { LeaderboardEntry } from '../types';

export const leaderboardApi = {
  getLeagueLeaderboard: (leagueId: string) =>
    api.get<{ leaderboard: LeaderboardEntry[] }>(`/leaderboard/${leagueId}`),
};
