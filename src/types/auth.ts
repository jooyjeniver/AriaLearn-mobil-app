export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  isActive: boolean;
  progress?: {
    completedLessons: number;
    totalHours: number;
    achievements: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  name: string;
  confirmPassword: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export interface UserDetails {
  name?: string;
  email?: string;
  // Add other user detail fields as needed
}

export interface PasswordUpdate {
  currentPassword: string;
  newPassword: string;
} 