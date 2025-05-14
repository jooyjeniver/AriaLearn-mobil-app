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
  Science: undefined;
  SubjectDetail: { subjectId: string };
  Lesson: { lessonId: string };
  Quiz: { quizId: string };
};

export type SubjectScreenNames = Exclude<keyof SubjectStackParamList, 'HomeTab'>;

export type RootTabParamList = {
  Home: undefined;
  'My Lessons': { selectedFilter?: string } | undefined;
  Progress: undefined;
  Games: undefined;
};

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

export type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  Main: undefined;
  Subject: { subjectId: string };
  UserProfile: undefined;
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
  QuizGameScreen: undefined;
  EmotionCapture: undefined;
  EmotionChart: undefined;
  SubjectDetails: {
    subjectId: string;
    subjectName: string;
    subjectColor?: string;
    subjectIcon?: string;
  };
  ARLearn: undefined;
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