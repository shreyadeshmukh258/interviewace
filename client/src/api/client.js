import axios from 'axios';

const getApiBaseUrl = () => {
  const envUrl = (import.meta.env.VITE_API_URL || '').trim().replace(/\/+$/, '');
  if (envUrl) {
    return envUrl.endsWith('/api') ? envUrl : `${envUrl}/api`;
  }
  // In production (Vercel), default to the live Render backend if VITE_API_URL wasn't set
  if (import.meta.env.PROD) {
    return 'https://interviewaceai-h25p.onrender.com/api';
  }
  return '/api';
};

const api = axios.create({ baseURL: getApiBaseUrl(), timeout: 60000 });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ia_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const message =
      err.response?.data?.message ||
      (err.code === 'ECONNABORTED'
        ? 'The request timed out. The server may be waking up, please try again.'
        : 'Network error. Check your connection');
    if (err.response?.status === 401 && localStorage.getItem('ia_token') && !err.config?.url?.includes('/auth/')) {
      localStorage.removeItem('ia_token');
      window.dispatchEvent(new Event('ia:logout'));
    }
    return Promise.reject(Object.assign(new Error(message), { status: err.response?.status }));
  }
);

export default api;
