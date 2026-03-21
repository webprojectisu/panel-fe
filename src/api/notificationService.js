import api from './axiosInstance';

export const getNotifications = (params) => api.get('/notifications', { params }).then(r => r.data);
export const getUnreadCount = () => api.get('/notifications/unread-count').then(r => r.data);
export const markAllRead = () => api.put('/notifications/read-all').then(r => r.data);
export const markRead = (id) => api.put(`/notifications/${id}/read`).then(r => r.data);
