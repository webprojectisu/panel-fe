import api from './axiosInstance';

export const getDietPlans = (params) => api.get('/diet-plans', { params }).then(r => r.data);
export const getDietPlan = (id) => api.get(`/diet-plans/${id}`).then(r => r.data);
export const createDietPlan = (data) => api.post('/diet-plans', data).then(r => r.data);
export const updateDietPlan = (id, data) => api.put(`/diet-plans/${id}`, data).then(r => r.data);
export const deleteDietPlan = (id) => api.delete(`/diet-plans/${id}`);
export const getMeals = (planId) => api.get(`/diet-plans/${planId}/meals`).then(r => r.data);
export const addMeal = (planId, data) => api.post(`/diet-plans/${planId}/meals`, data).then(r => r.data);
export const updateMeal = (mealId, data) => api.put(`/meals/${mealId}`, data).then(r => r.data);
export const deleteMeal = (mealId) => api.delete(`/meals/${mealId}`);
export const addFoodToMeal = (mealId, data) => api.post(`/meals/${mealId}/foods`, data).then(r => r.data);
export const removeFoodFromMeal = (mealId, foodId) => api.delete(`/meals/${mealId}/foods/${foodId}`);
