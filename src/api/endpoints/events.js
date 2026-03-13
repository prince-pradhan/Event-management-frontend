import apiClient from '../apiClient';

/**
 * Aligned with backend: bakend/src/controllers/event/event.controller.js
 * GET / → { success, events, pagination: { page, limit, total } }
 * GET /:id → { success, event } (event has category + organizer populated)
 * POST / → { success, event } (auth)
 * PUT /:id → { success, event } (auth)
 * DELETE /:id → { success, message } (auth)
 */
export const eventsApi = {
  getAll: (params) => apiClient.get('/events', { params }),
  getByInstitution: (institutionId, params) => apiClient.get(`/events/institution/${institutionId}`, { params }),
  getById: (id) => apiClient.get(`/events/${id}`),
  create: (data) => apiClient.post('/events', data),
  update: (id, data) => apiClient.put(`/events/${id}`, data),
  delete: (id) => apiClient.delete(`/events/${id}`),
  updateStatus: (id, status) => apiClient.post(`/events/${id}/status`, { status }),
  uploadBanner: ({ file, eventName }) => {
    const form = new FormData();
    if (file) form.append('bannerImage', file);
    if (eventName) form.append('eventName', eventName);
    return apiClient.post('/events/banner', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  patchBanner: (id, file) => {
    const form = new FormData();
    if (file) form.append('bannerImage', file);
    return apiClient.patch(`/events/${id}/banner`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
