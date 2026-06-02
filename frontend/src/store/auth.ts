import { create } from 'zustand';
import { User } from '../types';

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
}

const storedToken = localStorage.getItem('tribun_token');
const storedUser = localStorage.getItem('tribun_user');

export const useAuthStore = create<AuthStore>((set) => ({
  user: storedUser ? JSON.parse(storedUser) : null,
  token: storedToken,
  isAuthenticated: !!storedToken,
  setAuth: (user, token) => {
    localStorage.setItem('tribun_token', token);
    localStorage.setItem('tribun_user', JSON.stringify(user));
    set({ user, token, isAuthenticated: true });
  },
  clearAuth: () => {
    localStorage.removeItem('tribun_token');
    localStorage.removeItem('tribun_user');
    set({ user: null, token: null, isAuthenticated: false });
  },
}));
