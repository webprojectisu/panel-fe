import api from './axiosInstance';

export const getMe = () => api.get('/users/me').then(r => r.data);
export const updateMe = (data) => api.put('/users/me', data).then(r => r.data);
export const changePassword = (data) => api.put('/users/me/password', data).then(r => r.data);
