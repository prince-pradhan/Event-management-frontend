import apiClient from '../apiClient';

export const registrationsApi = {
    /** Admin: get registrations for a specific event */
    getByEvent: (eventId) => apiClient.get(`/registrations/event/${eventId}`),

    /** Student: get current user registrations */
    getMyRegistrations: () => apiClient.get('/registrations/mine'),

    /** Student: register for an event */
    register: (data) => apiClient.post('/registrations', data),

    /** Student: cancel registration */
    cancel: (id) => apiClient.delete(`/registrations/${id}`),
};
