import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

const axiosClient = axios.create({
  baseURL,
  withCredentials: true, // Crucial for sending & receiving HTTP-only cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach bearer token if stored (as fallback)
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for consistent response formatting and auth error handling
axiosClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred. Please try again.';

    // Custom enhanced error object
    const enhancedError = new Error(message);
    enhancedError.status = error.response?.status;
    enhancedError.errors = error.response?.data?.errors;
    enhancedError.data = error.response?.data;

    return Promise.reject(enhancedError);
  }
);

export default axiosClient;
