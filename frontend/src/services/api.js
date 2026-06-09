import axios from 'axios';

/**
 * Axios instance for Zyvora backend
 */

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  'https://zyvora-ecommerce-website.onrender.com/api';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

// Request interceptor to attach JWT token to Authorization header (fail-safe for cross-site cookie blocking)
api.interceptors.request.use(
  (config) => {
    try {
      const stored = JSON.parse(localStorage.getItem('zyvora_user'));
      if (stored?.token) {
        config.headers.Authorization = `Bearer ${stored.token}`;
      }
    } catch (e) {
      // Ignore JSON parsing errors
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Global error handler
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Something went wrong. Please try again.';

    return Promise.reject({
      ...error,
      message,
    });
  }
);

export default api;