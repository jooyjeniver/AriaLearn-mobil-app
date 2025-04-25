import React from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { SubjectStackParamList } from '../../types/navigation';
import SubjectScreen from '../../components/SubjectScreen';

type NavigationProp = NativeStackNavigationProp<SubjectStackParamList>;
type RouteProps = RouteProp<SubjectStackParamList, keyof SubjectStackParamList>;

interface Lesson {
  id: string;
  title: string;
  description: string;
  duration: string;
  progress: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  icon: string;
}

interface Subject {
  name: string;
  description: string;
  icon: string;
  color: string;
  lessons: Lesson[];
}

const subjectData: Record<string, Subject> = {
  'Myself and My Family': {
    name: 'Myself and My Family',
    description: 'Learn about yourself, your family, and relationships',
    icon: 'account-group',
    color: '#FF4F9A',
    lessons: [
      {
        id: '1',
        title: 'All About Me',
        description: 'Discover what makes you unique',
        duration: '15 min',
        progress: 0,
        difficulty: 'Beginner',
        icon: 'account',
      },
      {
        id: '2',
        title: 'My Family Members',
        description: 'Learn about different family roles',
        duration: '20 min',
        progress: 0,
        difficulty: 'Beginner',
        icon: 'account-group',
      },
    ],
  },
  'Our School and Community': {
    name: 'Our School and Community',
    description: 'Explore your school and local community',
    icon: 'school',
    color: '#4F7CFF',
    lessons: [
      {
        id: '1',
        title: 'My School',
        description: 'Learn about different places in school',
        duration: '15 min',
        progress: 0,
        difficulty: 'Beginner',
        icon: 'school',
      },
      {
        id: '2',
        title: 'Community Helpers',
        description: 'Discover people who help in our community',
        duration: '20 min',
        progress: 0,
        difficulty: 'Beginner',
        icon: 'account-group',
      },
    ],
  },
  'Good Habits and Citizenship': {
    name: 'Good Habits and Citizenship',
    description: 'Learn about good behavior and being a responsible citizen',
    icon: 'hand-heart',
    color: '#00C48C',
    lessons: [
      {
        id: '1',
        title: 'Daily Habits',
        description: 'Learn about good daily habits',
        duration: '15 min',
        progress: 0,
        difficulty: 'Beginner',
        icon: 'clock-check',
      },
      {
        id: '2',
        title: 'Being a Good Citizen',
        description: 'Understanding citizenship responsibilities',
        duration: '20 min',
        progress: 0,
        difficulty: 'Beginner',
        icon: 'account-check',
      },
    ],
  },
  'My Environment': {
    name: 'My Environment',
    description: 'Learn about nature and our surroundings',
    icon: 'nature',
    color: '#FFB800',
    lessons: [
      {
        id: '1',
        title: 'Plants Around Us',
        description: 'Discover different types of plants',
        duration: '15 min',
        progress: 0,
        difficulty: 'Beginner',
        icon: 'flower',
      },
      {
        id: '2',
        title: 'Weather and Seasons',
        description: 'Learn about different weather conditions',
        duration: '20 min',
        progress: 0,
        difficulty: 'Beginner',
        icon: 'weather-sunny',
      },
    ],
  },
  'Time and History': {
    name: 'Time and History',
    description: 'Explore concepts of time and historical events',
    icon: 'clock-time-four',
    color: '#BC4FFF',
    lessons: [
      {
        id: '1',
        title: 'Understanding Time',
        description: 'Learn about days, months, and years',
        duration: '15 min',
        progress: 0,
        difficulty: 'Beginner',
        icon: 'calendar',
      },
      {
        id: '2',
        title: 'Our History',
        description: 'Discover important historical events',
        duration: '20 min',
        progress: 0,
        difficulty: 'Beginner',
        icon: 'book-open-variant',
      },
    ],
  },
  'Transport and Communication': {
    name: 'Transport and Communication',
    description: 'Learn about different ways to travel and communicate',
    icon: 'bus-multiple',
    color: '#FF8A4F',
    lessons: [
      {
        id: '1',
        title: 'Types of Transport',
        description: 'Explore different modes of transportation',
        duration: '15 min',
        progress: 0,
        difficulty: 'Beginner',
        icon: 'car-multiple',
      },
      {
        id: '2',
        title: 'Communication Methods',
        description: 'Learn about ways people communicate',
        duration: '20 min',
        progress: 0,
        difficulty: 'Beginner',
        icon: 'message-text',
      },
    ],
  },
};

const SubjectScreenWrapper = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const subjectName = route.name as keyof typeof subjectData;
  const subject = subjectData[subjectName];

  if (!subject) {
    return null;
  }

  const handleLessonPress = (lessonId: string) => {
    // Handle lesson navigation here
    // For AR-enabled lessons, navigate to AR screen
  };

  return (
    <SubjectScreen
      title={subject.name}
      description={subject.description}
      mainColor={subject.color}
      icon={subject.icon}
      lessons={subject.lessons}
      onLessonPress={handleLessonPress}
    />
  );
};

export default SubjectScreenWrapper; 