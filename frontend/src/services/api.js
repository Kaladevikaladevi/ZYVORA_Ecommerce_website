import axios from 'axios';

/**
 * Axios instance for Zyvora backend
 */

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  'https://zyvora-ecommerce-website.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Attach JWT token if available
api.interceptors.request.use(
  (config) => {
    try {
      const stored = JSON.parse(localStorage.getItem('zyvora_user'));

      if (stored?.token) {
        config.headers.Authorization = `Bearer ${stored.token}`;
      }
    } catch (err) {
      console.error(err);
    }

    return config;
  },
  (error) => Promise.reject(error)
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