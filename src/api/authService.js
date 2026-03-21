import api from './axiosInstance';

export const login = (email, password) => api.post('/auth/login', { email, password }).then(r => r.data);
export const logout = () => api.post('/auth/logout').then(r => r.data);
export const register = (data) => api.post('/auth/register', data).then(r => r.data);
export const refreshToken = (refresh_token) => api.post('/auth/refresh', { refresh_token }).then(r => r.data);
