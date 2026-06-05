import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api',
  headers: { 'Content-Type': 'application/json' },
});

const SYNC_SECRET = import.meta.env.VITE_SYNC_SECRET as string | undefined;

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('tribun_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (SYNC_SECRET && config.url?.includes('/sync')) {
    config.headers['x-sync-secret'] = SYNC_SECRET;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('tribun_token');
      localStorage.removeItem('tribun_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
