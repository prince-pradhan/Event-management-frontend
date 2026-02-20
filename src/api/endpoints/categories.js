import apiClient from '../apiClient';

/**
 * Aligned with backend: bakend/src/controllers/event/category.controller.js
 * GET / → { success, categories } (Category: name, description)
 */
export const categoriesApi = {
  getAll: () => apiClient.get('/categories'),
  getById: (id) => apiClient.get(`/categories/${id}`),
  create: (data) => apiClient.post('/categories', data),
  update: (id, data) => apiClient.put(`/categories/${id}`, data),
  delete: (id) => apiClient.delete(`/categories/${id}`),
};
