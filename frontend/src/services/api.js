import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://scholarship-portal-api.vercel.app/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Format error messages and handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred. Please try again.';

    if (error.response?.status === 401) {
      // Clear token only if it's an invalid/expired token response
      if (
        message.includes('expired') ||
        message.includes('Invalid token') ||
        message.includes('No token provided')
      ) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }

    return Promise.reject({
      ...error,
      userMessage: message,
    });
  }
);

export default api;
