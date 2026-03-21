import api from './axiosInstance';

export const getAppointments = (params) => api.get('/appointments', { params }).then(r => r.data);
export const getAppointment = (id) => api.get(`/appointments/${id}`).then(r => r.data);
export const createAppointment = (data) => api.post('/appointments', data).then(r => r.data);
export const updateAppointment = (id, data) => api.put(`/appointments/${id}`, data).then(r => r.data);
export const deleteAppointment = (id) => api.delete(`/appointments/${id}`);
export const getTodayAppointments = () => api.get('/appointments/today').then(r => r.data);
