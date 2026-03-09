import apiClient from '../apiClient';

export const reviewApi = {
  getReviewsByEvent: (eventId) => {
    return apiClient.get(`/reviews/event/${eventId}`);
  },

  createReview: (reviewData) => {
    return apiClient.post('/reviews', reviewData);
  },

  updateReview: (reviewId, reviewData) => {
    return apiClient.patch(`/reviews/${reviewId}`, reviewData);
  },

  deleteReview: (reviewId) => {
    return apiClient.delete(`/reviews/${reviewId}`);
  },

  getMyReviews: () => {
    return apiClient.get('/reviews/mine');
  },
};
