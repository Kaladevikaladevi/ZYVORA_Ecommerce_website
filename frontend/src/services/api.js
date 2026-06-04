import axios from 'axios';

/**
 * Central Axios instance. In dev, Vite proxies /api to the Express backend.
 * `withCredentials` lets the HttpOnly auth cookie ride along automatically.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
});

// Normalize error messages so callers can rely on a consistent shape.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Something went wrong. Please try again.';
    return Promise.reject({ ...error, message });
  }
);

export default api;
