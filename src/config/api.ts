// API Configuration
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
  },
  
  // API Timeouts (in milliseconds)
  TIMEOUTS: {
    REQUEST: 10000, // 10 seconds
    UPLOAD: 30000,  // 30 seconds
  },
  
  // API Headers
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
}; 