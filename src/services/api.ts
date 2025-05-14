import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

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

// API Configuration
export const API_CONFIG = {
  BASE_URL: getBaseUrl(),
  ENDPOINTS: {
    // Health Check
    HEALTH: '/api/health',
    
    // Authentication Endpoints
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    CURRENT_USER: '/api/auth/me',
    LOGOUT: '/api/auth/logout',
    UPDATE_USER: '/api/auth/update',
    UPDATE_PASSWORD: '/api/auth/update-password',
    
    // User Endpoints
    PROFILE: '/api/profile',
    UPDATE_PROFILE: '/api/users/profile',
    USER_PROGRESS: '/api/users/progress',
    ALL_USERS: '/api/users',
    USER_BY_ID: '/api/users/:id',
    UPDATE_USER_BY_ID: '/api/users/:id',
    DELETE_USER: '/api/users/:id',
    
    // Module Endpoints
    MODULE_PROGRESS: '/api/modules/progress',
    ADD_MODULE_RESOURCES: '/api/modules/:id/resources',
    ADD_MODULE_MODELS: '/api/modules/:id/models',
    UPDATE_MODULE_PROGRESS: '/api/modules/:id/progress',
    
    // AR Model Endpoints
    ALL_AR_MODELS: '/api/armodels',
    CREATE_AR_MODEL: '/api/armodels',
    AR_MODEL_BY_ID: '/api/armodels/:id',
    UPDATE_AR_MODEL: '/api/armodels/:id',
    DELETE_AR_MODEL: '/api/armodels/:id',
    
    // Lesson Endpoints
    ALL_LESSONS: '/api/lessons',
    CREATE_LESSON: '/api/lessons',
    LESSON_BY_ID: '/api/lessons/:id',
    LESSON_DETAIL: '/api/lessons/detail/:id',
    UPDATE_LESSON: '/api/lessons/:id',
    DELETE_LESSON: '/api/lessons/:id',
    
    // Progress Endpoints
    OVERALL_PROGRESS: '/api/progress',
    UPDATE_LESSON_PROGRESS: '/api/progress/lesson',
    ADD_EMOTIONAL_DATA: '/api/progress/emotional-data',
    GET_EMOTIONAL_SUMMARY: '/api/progress/emotional-summary',
    
    // AI Endpoints
    ANALYZE_EMOTION: '/api/ai/analyze-emotion',
    GENERATE_QUIZ: '/api/ai/quiz',
    GET_RECOMMENDATIONS: '/api/ai/recommendations',
    GENERATE_GAME_STRATEGY: '/api/ai/game-strategy',
  }
} as const;

// Create axios instance with default config
const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Add request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Function to test API connection
export const testApiConnection = async () => {
  try {
    const baseUrl = getBaseUrl();
    console.log(`Testing connection to API at: ${baseUrl}`);
    
    // Use the health check endpoint instead of login
    const response = await fetch(`${baseUrl}${API_CONFIG.ENDPOINTS.HEALTH}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    // Even if we get a 401 or 400, it means the server is running
    // We just need to check if we get a response
    if (response.status < 500) {
      console.log('API connection successful');
      return true;
    } else {
      console.error('API connection failed:', response.status, response.statusText);
      return false;
    }
  } catch (error) {
    console.error('Error testing API connection:', error);
    return false;
  }
};

// Add response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle network errors
    if (!error.response) {
      console.error('Network error:', error.message);
      
      // Check if it's a connection issue
      const isConnected = await checkNetworkConnectivity();
      if (!isConnected) {
        return Promise.reject(new Error('No internet connection. Please check your network settings.'));
      }
      
      // Try to test API connection
      const isApiConnected = await testApiConnection();
      if (!isApiConnected) {
        return Promise.reject(new Error('Cannot connect to the server. Please check if the server is running.'));
      }
      
      return Promise.reject(new Error('Network error. Please check your internet connection.'));
    }
    
    // Log the error response for debugging
    console.error('API Error Response:', {
      status: error.response.status,
      data: error.response.data,
      headers: error.response.headers,
      url: error.config?.url,
      method: error.config?.method,
    });
    
    // Handle unauthorized access
    if (error.response.status === 401) {
      console.error('Unauthorized access. Token may be invalid or expired.');
      await AsyncStorage.removeItem('authToken');
      // You might want to redirect to login screen here
      return Promise.reject(new Error('Your session has expired. Please log in again.'));
    }
    
    // Handle server errors
    if (error.response.status >= 500) {
      console.error('Server error:', error.response.data);
      return Promise.reject(new Error('Server error. Please try again later.'));
    }
    
    // Handle validation errors
    if (error.response.status === 422) {
      const errorMessage = error.response.data.message || 'Validation error. Please check your input.';
      console.error('Validation error:', errorMessage);
      return Promise.reject(new Error(errorMessage));
    }
    
    // Handle other errors
    const errorMessage = error.response.data.message || 'An unexpected error occurred.';
    console.error('API error:', errorMessage);
    return Promise.reject(new Error(errorMessage));
  }
);

export default api; 