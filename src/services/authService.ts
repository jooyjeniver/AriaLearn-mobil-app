import api, { API_CONFIG } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, LoginCredentials, RegisterData, AuthResponse, UserDetails, PasswordUpdate } from '../types/auth';

class AuthService {
  private static instance: AuthService;
  private token: string | null = null;

  private constructor() {}

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      console.log('Attempting login with email:', credentials.email);
      console.log('API endpoint:', API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.LOGIN);
      
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LOGIN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
        }),
      });
      
      console.log('Login response status:', response.status);
      console.log('Login response headers:', {
        'content-type': response.headers.get('content-type'),
        'content-length': response.headers.get('content-length'),
        'date': response.headers.get('date'),
      });
      
      let responseData;
      try {
        const responseText = await response.text();
        console.log('Login response text:', responseText);
        responseData = responseText ? JSON.parse(responseText) : {};
      } catch (parseError) {
        console.error('Error parsing response:', parseError);
        throw new Error('Invalid response format from server');
      }
      
      if (!response.ok) {
        console.error('Login failed with status:', response.status);
        console.error('Login error response:', responseData);
        throw new Error(responseData.message || `Login failed with status: ${response.status}`);
      }
      
      console.log('Login response data:', JSON.stringify(responseData));
      
      // Check for the new response format with "success" field
      if (responseData.success && responseData.token) {
        // Create a mock user object since the server doesn't return user data
        const mockUser = {
          id: 'user-id', // This will be replaced when we fetch user data
          email: credentials.email,
          name: 'User', // This will be replaced when we fetch user data
        };
        
        await this.setToken(responseData.token);
        return { token: responseData.token, user: mockUser };
      }
      
      // Fallback to the expected format
      const { token, user } = responseData;
      
      if (!token) {
        console.error('No authentication token received in response');
        throw new Error('No authentication token received');
      }

      await this.setToken(token);
      return { token, user: user || { id: 'user-id', email: credentials.email, name: 'User' } };
    } catch (error) {
      console.error('Login error:', error);
      if (error instanceof Error) {
        throw new Error(`Login failed: ${error.message}`);
      }
      throw new Error('Login failed: An unexpected error occurred');
    }
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      console.log('Attempting registration with email:', data.email);
      console.log('API endpoint:', API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.REGISTER);
      
      if (data.password !== data.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      // Use fetch directly for more control
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.REGISTER}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Registration failed with status: ${response.status}`);
      }
      
      const responseData = await response.json();
      console.log('Registration response:', JSON.stringify(responseData));

      const { token, user } = responseData;
      
      if (!token) {
        console.error('No authentication token received in response');
        throw new Error('No authentication token received');
      }

      await this.setToken(token);
      return responseData;
    } catch (error) {
      console.error('Registration error:', error);
      if (error instanceof Error) {
        throw new Error(`Registration failed: ${error.message}`);
      }
      throw new Error('Registration failed: An unexpected error occurred');
    }
  }

  async logout(): Promise<void> {
    try {
      const token = await this.getToken();
      if (!token) {
        await AsyncStorage.removeItem('authToken');
        this.token = null;
        return;
      }
      
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LOGOUT}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      
      await AsyncStorage.removeItem('authToken');
      this.token = null;
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Logout failed with status: ${response.status}`);
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Even if there's an error, we've already cleared the token
    }
  }

  async getToken(): Promise<string | null> {
    if (this.token) {
      return this.token;
    }

    try {
      const token = await AsyncStorage.getItem('authToken');
      this.token = token;
      return token;
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }

  private async setToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem('authToken', token);
      this.token = token;
    } catch (error) {
      console.error('Error setting token:', error);
      throw new Error('Failed to save authentication token');
    }
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  async getCurrentUser(): Promise<AuthResponse['user']> {
    try {
      const token = await this.getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }
      
      // Use fetch directly for more control
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CURRENT_USER}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to get current user with status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to get current user: ${error.message}`);
      }
      throw new Error('Failed to get current user: An unexpected error occurred');
    }
  }

  async updateUserDetails(data: Partial<AuthResponse['user']>): Promise<AuthResponse['user']> {
    try {
      const token = await this.getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }
      
      // Use fetch directly for more control
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.UPDATE_USER}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to update user details with status: ${response.status}`);
      }
      
      const responseData = await response.json();
      return responseData;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to update user details: ${error.message}`);
      }
      throw new Error('Failed to update user details: An unexpected error occurred');
    }
  }

  async updatePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      const token = await this.getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }
      
      // Use fetch directly for more control
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.UPDATE_PASSWORD}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to update password with status: ${response.status}`);
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to update password: ${error.message}`);
      }
      throw new Error('Failed to update password: An unexpected error occurred');
    }
  }

  async signup(data: { name: string; email: string; password: string }): Promise<AuthResponse> {
    try {
      console.log('AuthService: Attempting signup with email:', data.email);
      console.log('API endpoint:', API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.REGISTER);
      
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.REGISTER}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      let responseData;
      try {
        const responseText = await response.text();
        console.log('Signup response text:', responseText);
        responseData = responseText ? JSON.parse(responseText) : {};
      } catch (parseError) {
        console.error('Error parsing response:', parseError);
        throw new Error('Invalid response format from server');
      }
      
      // Check if the response indicates success
      if (responseData.success === true && responseData.token) {
        console.log('AuthService: Signup successful with token');
        
        // Create a mock user object since the server doesn't return user data
        const mockUser = {
          id: 'user-id', // This will be replaced when we fetch user data
          email: data.email,
          name: data.name,
        };
        
        await this.setToken(responseData.token);
        return { token: responseData.token, user: mockUser };
      }
      
      // If we get here and the response is not ok, it's an error
      if (!response.ok) {
        console.error('Signup failed with status:', response.status);
        console.error('Signup error response:', responseData);
        
        // Extract error message from the response
        let errorMessage = 'Signup failed';
        if (responseData.error) {
          if (Array.isArray(responseData.error)) {
            errorMessage = responseData.error.join(', ');
          } else if (typeof responseData.error === 'string') {
            errorMessage = responseData.error;
          } else if (responseData.error.message) {
            errorMessage = responseData.error.message;
          }
        } else if (responseData.message) {
          errorMessage = responseData.message;
        }
        
        throw new Error(errorMessage);
      }
      
      // Fallback to the expected format
      const { token, user } = responseData;
      
      if (!token) {
        console.error('No authentication token received in response');
        throw new Error('No authentication token received');
      }

      await this.setToken(token);
      return { token, user: user || { id: 'user-id', email: data.email, name: data.name } };
    } catch (error) {
      console.error('AuthService: Signup error:', error);
      if (error instanceof Error) {
        throw error; // Just rethrow the error without wrapping it again
      }
      throw new Error('Signup failed: An unexpected error occurred');
    }
  }
}

export const authService = AuthService.getInstance(); 