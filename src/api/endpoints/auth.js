import apiClient from '../apiClient';

const AUTH_BASE = '/user';

/**
 * Backend: checkAuth → { success, user }, login/signup → { success, message, user },
 * allUsers GET /api/user/user → { success, users } (auth required)
 */
export const authApi = {
  checkAuth: () => apiClient.get(`${AUTH_BASE}/check-auth`),
  login: (credentials) => apiClient.post(`${AUTH_BASE}/login`, credentials),
  logout: () => apiClient.get(`${AUTH_BASE}/logout`),
  signup: (data) => apiClient.post(`${AUTH_BASE}/signup`, data),
  /** Backend expects { code } in body */
  verifyEmail: (code) => apiClient.post(`${AUTH_BASE}/verify-email`, { code }),
  forgotPassword: (email) => apiClient.post(`${AUTH_BASE}/forgot-password`, { email }),
  resetPassword: (token, password) =>
    apiClient.post(`${AUTH_BASE}/reset-password/${token}`, { password }),
  getUsers: (params) => apiClient.get(`${AUTH_BASE}/user`, { params }),
  /** Google sign-in: send ID token to backend */
  googleLogin: (idToken) => apiClient.post(`${AUTH_BASE}/google`, { token: idToken }),
};