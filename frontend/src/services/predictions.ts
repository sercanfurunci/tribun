import api from './api';
import { Prediction, UserStats } from '../types';

export const predictionsApi = {
  upsert: (matchId: string, leagueId: string, predictedHomeScore: number, predictedAwayScore: number) =>
    api.post<{ prediction: Prediction }>('/predictions', {
      matchId, leagueId, predictedHomeScore, predictedAwayScore,
    }),

  getMine: (leagueId?: string) =>
    api.get<{ predictions: Prediction[] }>(`/predictions/mine${leagueId ? `?leagueId=${leagueId}` : ''}`),

  getForMatch: (matchId: string, leagueId: string) =>
    api.get<{ predictions: Prediction[] }>(`/predictions/match/${matchId}?leagueId=${leagueId}`),

  getStats: (leagueId?: string) =>
    api.get<{ stats: UserStats }>(`/predictions/stats${leagueId ? `?leagueId=${leagueId}` : ''}`),
};
