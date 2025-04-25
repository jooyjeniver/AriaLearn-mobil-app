import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { API_CONFIG } from '../config/api';

// Function to check network connectivity - simplified for physical devices
const checkNetworkConnectivity = async () => {
  try {
    // Simple check by making a request to a reliable endpoint
    const response = await fetch('https://www.google.com', { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.error('Error checking network connectivity:', error);
    return false;
  }
};

// Function to get the appropriate base URL based on the environment
const getBaseUrl = () => {
  if (__DEV__) {
    // Development environment
    if (Platform.OS === 'android') {
      // For Android physical device - using the actual IP address
      return 'http://192.168.8.192:5000';
    } else if (Platform.OS === 'ios') {
      // For iOS physical device
      return 'http://192.168.8.192:5000';
    } else {
      // Fallback
      return 'http://192.168.8.192:5000';
    }
  } else {
    // Production environment
    return 'https://api.arialearn.com';
  }
};

// Create axios instance with default config
const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUTS.REQUEST,
  headers: {
    ...API_CONFIG.HEADERS,
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache'
  },
});

// Request interceptor
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      // Log request details in development
      if (__DEV__) {
        console.log('API Request:', {
          url: config.url,
          method: config.method,
          baseURL: config.baseURL,
          headers: config.headers,
        });
      }
      
      return config;
    } catch (error) {
      console.error('Error in request interceptor:', error);
      return Promise.reject(error);
    }
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Log response in development
    if (__DEV__) {
      console.log('API Response:', {
        url: response.config.url,
        status: response.status,
        data: response.data,
      });
    }
    return response;
  },
  async (error) => {
    // Log error details
    console.error('API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data,
    });

    const originalRequest = error.config;

    // Handle 401 errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // Attempt to refresh token or handle authentication error
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token available');
        }
        return api(originalRequest);
      } catch (refreshError) {
        console.error('Authentication refresh failed:', refreshError);
        // Clear token and redirect to login if needed
        await AsyncStorage.removeItem('token');
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const testApiConnection = async () => {
  try {
    console.log('Testing API connection...');
    const response = await api.get(API_CONFIG.ENDPOINTS.HEALTH);
    console.log('API health check response:', response.data);
    return true;
  } catch (error) {
    console.error('API connection test failed:', error);
    return false;
  }
};

export default api; 