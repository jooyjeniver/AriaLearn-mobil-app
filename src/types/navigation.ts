import { NavigatorScreenParams } from '@react-navigation/native';
import type { SubjectType } from './lessons';

export type SubjectStackParamList = {
  HomeTab: undefined;
  'Myself and My Family': undefined;
  'Our School and Community': undefined;
  'Good Habits and Citizenship': undefined;
  'My Environment': undefined;
  'Time and History': undefined;
  'Transport and Communication': undefined;
  UserProfile: undefined;
  'AR Learn': undefined;
};

export type SubjectScreenNames = Exclude<keyof SubjectStackParamList, 'HomeTab'>;

export type RootTabParamList = {
  Home: undefined;
  'My Lessons': undefined;
  Progress: undefined;
  Games: undefined;
};

export type RootStackParamList = {
  Main: undefined;
  Auth: undefined;
  'AR Learn': undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
  ApiTest: undefined;
};

export type MainStackParamList = {
  Home: undefined;
  Profile: undefined;
  Settings: undefined;
};

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  progress: {
    completedLessons: number;
    totalHours: number;
    achievements: number;
  };
} 