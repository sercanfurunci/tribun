import api from './api';
import { Match } from '../types';

export const matchesApi = {
  getUpcoming: () => api.get<{ matches: Match[] }>('/matches/upcoming'),
  getFinished: (limit = 20, offset = 0) =>
    api.get<{ matches: Match[] }>(`/matches/finished?limit=${limit}&offset=${offset}`),
  getLive: () => api.get<{ matches: Match[] }>('/matches/live'),
  getById: (id: string) => api.get<{ match: Match }>(`/matches/${id}`),
  getAll: (status?: string, tournament?: string) => {
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    if (tournament) params.set('tournament', tournament);
    return api.get<{ matches: Match[] }>(`/matches?${params.toString()}`);
  },
};
