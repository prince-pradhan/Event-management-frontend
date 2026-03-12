import apiClient from '../apiClient';

/**
 * Aligned with backend: backend/src/controllers/institution/institution.controller.js
 */
export const institutionsApi = {
  apply: (data) => apiClient.post('/institutions/apply', data),
  getMine: () => apiClient.get('/institutions/mine'),
  list: (status) => apiClient.get('/institutions', { params: { status } }),
  getById: (id) => apiClient.get(`/institutions/${id}`),
  updateStatus: (id, status, verificationNotes) => apiClient.patch(`/institutions/${id}/status`, { status, verificationNotes }),
};
