import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:8000' });

// Request: inject token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response: 401 → redirect to login; 5xx → dispatch 'api-error' event
api.interceptors.response.use(
  res => res,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    } else if (error.response?.status >= 500) {
      window.dispatchEvent(new CustomEvent('api-error', { detail: error.response.data }));
    }
    return Promise.reject(error);
  }
);

export default api;
