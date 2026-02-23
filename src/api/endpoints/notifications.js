import apiClient from '../apiClient';

export const notificationApi = {
    /** Fetch notifications for current user */
    getMe: (params) => apiClient.get('/notifications/me', { params }),

    /** Mark a notification as read */
    markRead: (id) => apiClient.patch(`/notifications/${id}/read`),

    /** Delete a notification (soft delete for users) */
    delete: (id) => apiClient.delete(`/notifications/${id}`),

    /** Admin: create a custom notification */
    create: (data) => apiClient.post('/notifications', data),

    /** Admin: get all notifications */
    getAll: (params) => apiClient.get('/notifications', { params }),

    /** Get notification by ID */
    getById: (id) => apiClient.get(`/notifications/${id}`),
};
