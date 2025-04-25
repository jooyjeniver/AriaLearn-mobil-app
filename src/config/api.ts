import { Platform } from 'react-native';

// API Configuration
export const API_CONFIG = {
  // Base URL for API requests
  BASE_URL: __DEV__
    ? Platform.OS === 'android'
      ? 'http://192.168.8.192:5000/api'  // Android Emulator
      : 'http://localhost:5000/api'  // iOS Simulator
    : 'https://api.arialearn.com/api', // Production URL
  
  // API Endpoints
  ENDPOINTS: {
    // System endpoints
    HEALTH: '/health',

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
    
    // AR endpoints
    AR_MODELS: '/armodels',
    AR_MODEL_DETAIL: (id: string) => `/armodels/${id}`,

    // AI endpoints
    ANALYZE_EMOTION: '/ai/analyze-emotion',
    GENERATE_QUIZ: '/ai/generate-quiz',
    GET_RECOMMENDATIONS: '/ai/recommendations',
    GENERATE_GAME_STRATEGY: '/ai/game-strategy',
  },
  
  // API Timeouts (in milliseconds)
  TIMEOUTS: {
    REQUEST: 15000, // 15 seconds
    UPLOAD: 30000,  // 30 seconds
    MODEL_LOAD: 20000, // 20 seconds for 3D models
  },
  
  // API Headers
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
}; 