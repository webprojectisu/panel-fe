import api from './axiosInstance';

export const getDashboardStats = (period = 'monthly') => api.get('/dashboard/stats', { params: { period } }).then(r => r.data);
