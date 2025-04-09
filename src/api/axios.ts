import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../config/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Add a request interceptor to add the auth token to requests
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting token from AsyncStorage:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle network errors
    if (!error.response) {
      return Promise.reject(new Error('Network error. Please check your connection.'));
    }

    // Handle specific error status codes
    switch (error.response.status) {
      case 401:
        // Unauthorized - token expired or invalid
        AsyncStorage.removeItem('token');
        return Promise.reject(new Error('Session expired. Please login again.'));
      case 403:
        return Promise.reject(new Error('Access denied. You do not have permission to perform this action.'));
      case 404:
        return Promise.reject(new Error('Resource not found.'));
      case 500:
        return Promise.reject(new Error('Server error. Please try again later.'));
      default:
        // For other errors, return the error message from the server if available
        const errorMessage = error.response.data?.message || error.message || 'An error occurred';
        return Promise.reject(new Error(errorMessage));
    }
  }
);

export default api; 