/**
 * API Client Wrapper
 * Centralized axios instance with interceptors for authentication,
 * error handling, and request/response transformation
 */

import axios from 'axios';
import { API_URL } from '../redux/API';
import { getToken, isTokenExpired, logout } from './auth';

/**
 * Create axios instance with default configuration
 */
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor - adds auth token to requests
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    
    // Add token to headers if available
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Check if token is expired before making request
    if (token && isTokenExpired()) {
      // Token expired, clear auth and redirect to login
      logout();
      window.location.href = '/scorecard/admin/login';
      return Promise.reject(new Error('Token expired'));
    }
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

/**
 * Response interceptor - handles errors globally
 */
apiClient.interceptors.response.use(
  (response) => {
    // Return successful responses as-is
    return response;
  },
  (error) => {
    // Handle different error scenarios
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      // Handle 401 Unauthorized - token invalid or expired
      if (status === 401) {
        logout();
        window.location.href = '/scorecard/admin/login';
        return Promise.reject(new Error('Unauthorized - Please login again'));
      }
      
      // Handle 403 Forbidden - insufficient permissions
      if (status === 403) {
        return Promise.reject(new Error(data?.message || 'Access denied: Insufficient permissions'));
      }
      
      // Handle 404 Not Found
      if (status === 404) {
        return Promise.reject(new Error(data?.message || 'Resource not found'));
      }
      
      // Handle 500 Server Error
      if (status >= 500) {
        return Promise.reject(new Error(data?.message || 'Server error - Please try again later'));
      }
      
      // Return error with message from server
      return Promise.reject(new Error(data?.message || `Request failed with status ${status}`));
    } else if (error.request) {
      // Request made but no response received
      return Promise.reject(new Error('Network error - Please check your connection'));
    } else {
      // Error in request setup
      return Promise.reject(error);
    }
  }
);

/**
 * API Client methods with convenience wrappers
 */
export const api = {
  /**
   * GET request
   * @param {string} url - Endpoint URL
   * @param {Object} config - Axios config
   * @returns {Promise} - Axios response
   */
  get: (url, config = {}) => {
    return apiClient.get(url, config);
  },

  /**
   * POST request
   * @param {string} url - Endpoint URL
   * @param {any} data - Request body
   * @param {Object} config - Axios config
   * @returns {Promise} - Axios response
   */
  post: (url, data, config = {}) => {
    return apiClient.post(url, data, config);
  },

  /**
   * PUT request
   * @param {string} url - Endpoint URL
   * @param {any} data - Request body
   * @param {Object} config - Axios config
   * @returns {Promise} - Axios response
   */
  put: (url, data, config = {}) => {
    return apiClient.put(url, data, config);
  },

  /**
   * PATCH request
   * @param {string} url - Endpoint URL
   * @param {any} data - Request body
   * @param {Object} config - Axios config
   * @returns {Promise} - Axios response
   */
  patch: (url, data, config = {}) => {
    return apiClient.patch(url, data, config);
  },

  /**
   * DELETE request
   * @param {string} url - Endpoint URL
   * @param {Object} config - Axios config
   * @returns {Promise} - Axios response
   */
  delete: (url, config = {}) => {
    return apiClient.delete(url, config);
  },
};

/**
 * Export the axios instance for advanced usage
 */
export default apiClient;

