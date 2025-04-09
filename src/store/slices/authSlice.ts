import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../api/axios';
import { API_CONFIG } from '../../config/api';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  progress?: {
    completedLessons: number;
    totalHours: number;
    achievements: number;
  };
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

// Helper function to get token from AsyncStorage
const getStoredToken = async () => {
  try {
    return await AsyncStorage.getItem('token');
  } catch (error) {
    console.error('Error getting token from AsyncStorage:', error);
    return null;
  }
};

// Initialize state with token from AsyncStorage
const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

// Async thunks
export const register = createAsyncThunk(
  'auth/register',
  async (userData: { name: string; email: string; password: string }) => {
    try {
      const response = await api.post(API_CONFIG.ENDPOINTS.REGISTER, userData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Registration failed');
    }
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }) => {
    try {
      const response = await api.post(API_CONFIG.ENDPOINTS.LOGIN, credentials);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Login failed');
    }
  }
);

export const getCurrentUser = createAsyncThunk('auth/getCurrentUser', async () => {
  try {
    const response = await api.get(API_CONFIG.ENDPOINTS.CURRENT_USER);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Failed to get user data');
  }
});

export const logout = createAsyncThunk('auth/logout', async () => {
  try {
    await api.get(API_CONFIG.ENDPOINTS.LOGOUT);
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    await AsyncStorage.removeItem('token');
  }
});

export const updateUserDetails = createAsyncThunk(
  'auth/updateUserDetails',
  async (userData: { name: string; email: string }) => {
    try {
      const response = await api.put(API_CONFIG.ENDPOINTS.UPDATE_DETAILS, userData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Update failed');
    }
  }
);

export const updatePassword = createAsyncThunk(
  'auth/updatePassword',
  async (passwordData: { currentPassword: string; newPassword: string }) => {
    try {
      const response = await api.put(API_CONFIG.ENDPOINTS.UPDATE_PASSWORD, passwordData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Password update failed');
    }
  }
);

// Initialize token from AsyncStorage
export const initializeAuth = createAsyncThunk('auth/initialize', async () => {
  const token = await getStoredToken();
  return token;
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Initialize
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.token = action.payload;
        state.isAuthenticated = !!action.payload;
      })
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        AsyncStorage.setItem('token', action.payload.token);
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Registration failed';
      })
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        AsyncStorage.setItem('token', action.payload.token);
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Login failed';
      })
      // Get Current User
      .addCase(getCurrentUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(getCurrentUser.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        AsyncStorage.removeItem('token');
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      })
      // Update User Details
      .addCase(updateUserDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(updateUserDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Update failed';
      })
      // Update Password
      .addCase(updatePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePassword.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updatePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Password update failed';
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer; 