import api, { API_CONFIG } from './api';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  // Add other profile fields as needed
}

export interface UserProgress {
  completedLessons: number;
  totalLessons: number;
  completedModules: number;
  totalModules: number;
  // Add other progress fields as needed
}

class UserService {
  private static instance: UserService;

  private constructor() {}

  static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  // Get user profile
  async getProfile(): Promise<UserProfile> {
    try {
      const response = await api.get<UserProfile>(API_CONFIG.ENDPOINTS.PROFILE);
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to get profile: ${error.message}`);
      }
      throw new Error('Failed to get profile: An unexpected error occurred');
    }
  }

  // Update user profile
  async updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const response = await api.put<UserProfile>(API_CONFIG.ENDPOINTS.UPDATE_PROFILE, data);
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to update profile: ${error.message}`);
      }
      throw new Error('Failed to update profile: An unexpected error occurred');
    }
  }

  // Get user progress
  async getUserProgress(): Promise<UserProgress> {
    try {
      const response = await api.get<UserProgress>(API_CONFIG.ENDPOINTS.USER_PROGRESS);
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to get user progress: ${error.message}`);
      }
      throw new Error('Failed to get user progress: An unexpected error occurred');
    }
  }

  // Admin only: Get all users
  async getAllUsers(): Promise<UserProfile[]> {
    try {
      const response = await api.get<UserProfile[]>(API_CONFIG.ENDPOINTS.ALL_USERS);
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to get all users: ${error.message}`);
      }
      throw new Error('Failed to get all users: An unexpected error occurred');
    }
  }

  // Admin only: Get user by ID
  async getUserById(id: string): Promise<UserProfile> {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.USER_BY_ID.replace(':id', id);
      const response = await api.get<UserProfile>(endpoint);
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to get user by ID: ${error.message}`);
      }
      throw new Error('Failed to get user by ID: An unexpected error occurred');
    }
  }

  // Admin only: Update user by ID
  async updateUserById(id: string, data: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.UPDATE_USER_BY_ID.replace(':id', id);
      const response = await api.put<UserProfile>(endpoint, data);
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to update user by ID: ${error.message}`);
      }
      throw new Error('Failed to update user by ID: An unexpected error occurred');
    }
  }

  // Admin only: Delete user by ID
  async deleteUserById(id: string): Promise<void> {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.DELETE_USER.replace(':id', id);
      await api.delete(endpoint);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to delete user by ID: ${error.message}`);
      }
      throw new Error('Failed to delete user by ID: An unexpected error occurred');
    }
  }
}

export const userService = UserService.getInstance(); 