import axios from 'axios';

const api = axios.create({ baseURL: `${import.meta.env.VITE_API_URL || ''}/api`, timeout: 60000 });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ia_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const message = err.response?.data?.message || (err.code === 'ECONNABORTED' ? 'The request timed out' : 'Network error. Check your connection');
    if (err.response?.status === 401 && localStorage.getItem('ia_token') && !err.config.url.includes('/auth/')) {
      localStorage.removeItem('ia_token');
      window.dispatchEvent(new Event('ia:logout'));
    }
    return Promise.reject(Object.assign(new Error(message), { status: err.response?.status }));
  }
);

export default api;
