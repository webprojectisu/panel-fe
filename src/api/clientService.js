import api from './axiosInstance';

export const getClients = (params) => api.get('/clients', { params }).then(r => r.data);
export const getClient = (id) => api.get(`/clients/${id}`).then(r => r.data);
export const createClient = (data) => api.post('/clients', data).then(r => r.data);
export const updateClient = (id, data) => api.put(`/clients/${id}`, data).then(r => r.data);
export const deleteClient = (id) => api.delete(`/clients/${id}`);
export const getClientSummary = (id) => api.get(`/clients/${id}/summary`).then(r => r.data);
export const getClientMeasurements = (id, params) => api.get(`/clients/${id}/measurements`, { params }).then(r => r.data);
export const getLatestMeasurement = (id) => api.get(`/clients/${id}/measurements/latest`).then(r => r.data);
export const addMeasurement = (clientId, data) => api.post(`/clients/${clientId}/measurements`, data).then(r => r.data);
export const deleteMeasurement = (id) => api.delete(`/measurements/${id}`);
