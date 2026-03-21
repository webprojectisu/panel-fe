import api from './axiosInstance';

export const getPayments = (params) => api.get('/payments', { params }).then(r => r.data);
export const createPayment = (data) => api.post('/payments', data).then(r => r.data);
export const updatePayment = (id, data) => api.put(`/payments/${id}`, data).then(r => r.data);
export const deletePayment = (id) => api.delete(`/payments/${id}`);
export const getPaymentSummary = (params) => api.get('/payments/summary', { params }).then(r => r.data);
