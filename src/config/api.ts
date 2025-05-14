// API Configuration

// Base URLs for different environments
const API_ENDPOINTS = {
  development: {
    // Use your local API server when developing
    EMOTION_API: 'http://192.168.8.192:5000/api/emotion/analyze', // For Android Emulator
    // EMOTION_API: 'http://localhost:5000/api/emotion/analyze', // For iOS simulator
  },
  production: {
    // Use your production API server when deployed
    EMOTION_API: 'https://your-production-api.com/api/emotion/analyze',
  },
  staging: {
    // Use your staging API server when testing
    EMOTION_API: 'https://your-staging-api.com/api/emotion/analyze',
  },
};

// Determine the current environment
// In a real app, you might want to get this from an environment variable
const ENVIRONMENT = __DEV__ ? 'development' : 'production';

// Export the API endpoints for the current environment
export const API = API_ENDPOINTS[ENVIRONMENT];

// API request timeouts in milliseconds
export const TIMEOUTS = {
  SHORT: 5000,    // 5 seconds
  STANDARD: 15000, // 15 seconds
  LONG: 30000,    // 30 seconds
  VERY_LONG: 60000 // 60 seconds
};

// Other API related configuration
export const API_CONFIG = {
  // Base URL for API requests
  BASE_URL: 'http://192.168.8.192:5000/api',
  
  // API Endpoints
  ENDPOINTS: {
    // Auth endpoints
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    CURRENT_USER: '/auth/me',
    UPDATE_DETAILS: '/auth/updatedetails',
    UPDATE_PASSWORD: '/auth/updatepassword',
    FORGOT_PASSWORD: '/auth/forgotpassword',
    RESET_PASSWORD: '/auth/resetpassword',
    
    // User endpoints
    USER_PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile',
    UPLOAD_AVATAR: '/users/avatar',
    
    // Content endpoints
    SUBJECTS: '/v1/subjects',
    LESSONS: '/lessons',
    PROGRESS: '/progress',
    ACHIEVEMENTS: '/achievements',
    QUIZZES: '/quizzes',
    // AR Model Endpoints
    ALL_AR_MODELS: '/armodels',
  }
};

export default {
  API,
  TIMEOUTS,
  API_CONFIG
}; 