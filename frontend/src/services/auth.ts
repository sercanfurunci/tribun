import api from './api';
import { User } from '../types';

export const authApi = {
  register: (username: string, email: string, password: string) =>
    api.post<{ user: User; token: string }>('/auth/register', { username, email, password }),

  login: (email: string, password: string) =>
    api.post<{ user: User; token: string }>('/auth/login', { email, password }),

  getMe: () =>
    api.get<{ user: User }>('/auth/me'),
};
