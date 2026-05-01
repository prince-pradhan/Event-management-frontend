import apiClient from '../apiClient';

export const paypalApi = {
    createOrder: (registrationId) => apiClient.post('/paypal/create-order', { registrationId }),
    captureOrder: (orderId) => apiClient.post('/paypal/capture-order', { orderId }),
};
