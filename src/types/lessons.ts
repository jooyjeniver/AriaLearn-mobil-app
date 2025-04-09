export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export interface Lesson {
  id: string;
  title: string;
  description: string;
  duration: string;
  progress: number;
  difficulty: Difficulty;
  icon: string;
  arEnabled?: boolean;
  subject: string;
  isComplete?: boolean;
}

export type SubjectType = {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  lessons: Lesson[];
};

export const subjectData: Record<string, SubjectType> = {
  Science: {
    id: 'science',
    name: 'Science',
    description: 'Explore the wonders of the natural world through interactive lessons',
    icon: 'flask',
    color: '#4CAF50',
    lessons: [
      {
        id: 'science-1',
        title: 'Solar System Exploration',
        description: 'Learn about planets, stars, and space phenomena in our solar system',
        duration: '45 mins',
        progress: 75,
        difficulty: 'Intermediate',
        icon: 'rocket',
        arEnabled: true,
        subject: 'Science',
      },
      {
        id: 'science-2',
        title: 'Human Body Systems',
        description: 'Explore the circulatory, respiratory, and digestive systems',
        duration: '30 mins',
        progress: 100,
        difficulty: 'Beginner',
        icon: 'human',
        subject: 'Science',
      },
      {
        id: 'science-3',
        title: 'Chemistry Basics',
        description: 'Introduction to atoms, molecules, and chemical reactions',
        duration: '40 mins',
        progress: 0,
        difficulty: 'Advanced',
        icon: 'flask',
        subject: 'Science',
      },
      {
        id: 'science-4',
        title: 'Animal Kingdom',
        description: 'Discover different species and their habitats',
        duration: '35 mins',
        progress: 25,
        difficulty: 'Beginner',
        icon: 'paw',
        subject: 'Science',
      },
    ],
  },
  Mathematics: {
    id: 'mathematics',
    name: 'Mathematics',
    description: 'Master mathematical concepts through interactive visualizations',
    icon: 'calculator',
    color: '#2196F3',
    lessons: [
      {
        id: 'math-1',
        title: 'Geometry in 3D',
        description: 'Explore geometric shapes and their properties in three dimensions',
        duration: '40 mins',
        progress: 50,
        difficulty: 'Intermediate',
        icon: 'cube-outline',
        arEnabled: true,
        subject: 'Mathematics',
      },
      {
        id: 'math-2',
        title: 'Basic Algebra',
        description: 'Learn about variables, equations, and algebraic expressions',
        duration: '35 mins',
        progress: 100,
        difficulty: 'Beginner',
        icon: 'function-variant',
        subject: 'Mathematics',
      },
      {
        id: 'math-3',
        title: 'Trigonometry',
        description: 'Study angles, triangles, and trigonometric functions',
        duration: '45 mins',
        progress: 0,
        difficulty: 'Advanced',
        icon: 'triangle-outline',
        subject: 'Mathematics',
      },
      {
        id: 'math-4',
        title: 'Statistics',
        description: 'Introduction to data analysis and probability',
        duration: '30 mins',
        progress: 25,
        difficulty: 'Intermediate',
        icon: 'chart-bell-curve',
        subject: 'Mathematics',
      },
    ],
  },
  Language: {
    id: 'language',
    name: 'Language',
    description: 'Develop your language skills through interactive exercises',
    icon: 'book-alphabet',
    color: '#9C27B0',
    lessons: [
      {
        id: 'lang-1',
        title: 'Grammar Basics',
        description: 'Learn essential grammar rules and sentence structure',
        duration: '30 mins',
        progress: 0,
        difficulty: 'Beginner',
        icon: 'format-text',
        subject: 'Language',
      },
    ],
  },
  'Social Studies': {
    id: 'social-studies',
    name: 'Social Studies',
    description: 'Discover history, geography, and cultures of the world',
    icon: 'earth',
    color: '#FF9800',
    lessons: [
      {
        id: 'social-1',
        title: 'World History',
        description: 'Explore major events and civilizations throughout history',
        duration: '45 mins',
        progress: 0,
        difficulty: 'Intermediate',
        icon: 'book-open-page-variant',
        subject: 'Social Studies',
      },
    ],
  },
  Music: {
    id: 'music',
    name: 'Music',
    description: 'Learn music theory and appreciation',
    icon: 'music',
    color: '#E91E63',
    lessons: [
      {
        id: 'music-1',
        title: 'Music Theory',
        description: 'Understanding notes, scales, and rhythm',
        duration: '30 mins',
        progress: 0,
        difficulty: 'Beginner',
        icon: 'music-note',
        subject: 'Music',
      },
    ],
  },
  Art: {
    id: 'art',
    name: 'Art',
    description: 'Explore various art forms and techniques',
    icon: 'palette',
    color: '#3F51B5',
    lessons: [
      {
        id: 'art-1',
        title: 'Color Theory',
        description: 'Learn about color wheels, schemes, and harmonies',
        duration: '35 mins',
        progress: 0,
        difficulty: 'Beginner',
        icon: 'palette',
        subject: 'Art',
      },
    ],
  },
};

export type Subject = SubjectType | 'All';

export interface LessonSection {
  title: string;
  lessons: Lesson[];
}

export interface DailyRecommendation {
  id: string;
  title: string;
  description: string;
  icon: string;
  subject: SubjectType;
} 