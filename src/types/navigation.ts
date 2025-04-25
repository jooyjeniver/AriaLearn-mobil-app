import { NavigatorScreenParams } from '@react-navigation/native';
import type { SubjectType } from './lessons';
import type { Module } from './modules';

export type LessonsStackParamList = {
  LessonsList: {
    selectedFilter?: string;
  };
  Subject: {
    module: {
      id: string;
      name: string;
      icon: string;
      description: string;
      difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
      category: string;
      lessons: string[];
      color?: string;
    }
  };
};

export type SubjectStackParamList = {
  HomeTab: undefined;
  UserProfile: undefined;
};

export type SubjectScreenNames = Exclude<keyof SubjectStackParamList, 'HomeTab'>;

export type RootTabParamList = {
  Home: undefined;
  'My Lessons': NavigatorScreenParams<LessonsStackParamList>;
  Progress: undefined;
  Games: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  'AR Learn': undefined;
};

export type MainStackParamList = {
  Home: undefined;
  Profile: undefined;
  Subject: {
    module: {
      id: string;
      name: string;
      icon: string;
      description: string;
      difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
      category: string;
      lessons: string[];
      color?: string;
    }
  };
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