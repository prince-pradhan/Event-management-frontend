import apiClient from '../apiClient';

/**
 * Aligned with backend: bakend/src/controllers/event/category.controller.js
 * GET / → { success, categories } (Category: name, description)
 */
export const categoriesApi = {
  getAll: () => apiClient.get('/categories'),
};
