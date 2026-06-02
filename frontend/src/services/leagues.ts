import api from './api';
import { League } from '../types';

export const leaguesApi = {
  getAll: () => api.get<{ leagues: League[] }>('/leagues'),

  getById: (id: string) => api.get<{ league: League }>(`/leagues/${id}`),

  create: (name: string, description?: string) =>
    api.post<{ league: League }>('/leagues', { name, description }),

  join: (inviteCode: string) =>
    api.post<{ league: League }>('/leagues/join', { inviteCode }),

  leave: (id: string) => api.delete(`/leagues/${id}/leave`),

  getMembers: (id: string) =>
    api.get<{ members: Array<{ id: string; username: string; avatar_url?: string; joined_at: string }> }>(
      `/leagues/${id}/members`
    ),
};
