export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export interface Lesson {
  id: string;
  title: string;
  description: string;
  duration: string;
  progress: number;
  difficulty: Difficulty;
  icon: string;
  subject: string;
  arEnabled: boolean;
  learningObjectives: string[];
  keyConcepts: string[];
  activities: string[];
  vocabulary: string[];
  _id: string;
  color?: string;
}

export interface SubjectData {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  lessons: Lesson[];
}

export type SubjectType = 'Science' | 'Mathematics' | 'Language' | 'Social Studies' | 'Music' | 'Art';

export const subjectData: Record<SubjectType, SubjectData> = {
  Science: {
    id: 'science',
    title: 'Science',
    description: 'Explore the wonders of science',
    icon: 'flask',
    color: '#4CAF50',
    lessons: [
      {
        id: 'science-1',
        title: 'Animal Kingdom',
        description: 'Learn about different animal species and their habitats',
        duration: '15 min',
        progress: 75,
        difficulty: 'Beginner',
        icon: 'paw',
        subject: 'Science',
        arEnabled: true,
        learningObjectives: ['Understand animal classifications', 'Learn about habitats'],
        keyConcepts: ['Mammals', 'Birds', 'Reptiles', 'Amphibians'],
        activities: ['Animal matching game', 'Habitat diorama'],
        vocabulary: ['Habitat', 'Species', 'Classification'],
        _id: 'science-1',
        color: '#4CAF50'
      }
    ]
  },
  Mathematics: {
    id: 'math',
    title: 'Mathematics',
    description: 'Master mathematical concepts',
    icon: 'calculator',
    color: '#2196F3',
    lessons: [
      {
        id: 'math-1',
        title: 'Addition & Subtraction',
        description: 'Practice basic math with fun examples',
        duration: '10 min',
        progress: 100,
        difficulty: 'Beginner',
        icon: 'calculator',
        subject: 'Mathematics',
        arEnabled: false,
        learningObjectives: ['Basic addition', 'Basic subtraction'],
        keyConcepts: ['Addition', 'Subtraction', 'Numbers'],
        activities: ['Number line practice', 'Word problems'],
        vocabulary: ['Add', 'Subtract', 'Sum', 'Difference'],
        _id: 'math-1',
        color: '#2196F3'
      }
    ]
  },
  Language: {
    id: 'language',
    title: 'Language',
    description: 'Develop language skills',
    icon: 'book-alphabet',
    color: '#9C27B0',
    lessons: [
      {
        id: 'lang-1',
        title: 'Basic Grammar',
        description: 'Learn essential grammar rules',
        duration: '12 min',
        progress: 50,
        difficulty: 'Beginner',
        icon: 'book-alphabet',
        subject: 'Language',
        arEnabled: false,
        learningObjectives: ['Parts of speech', 'Basic sentence structure'],
        keyConcepts: ['Nouns', 'Verbs', 'Adjectives'],
        activities: ['Word sorting', 'Sentence building'],
        vocabulary: ['Noun', 'Verb', 'Adjective', 'Sentence'],
        _id: 'lang-1',
        color: '#9C27B0'
      }
    ]
  },
  'Social Studies': {
    id: 'social',
    title: 'Social Studies',
    description: 'Understand society and culture',
    icon: 'earth',
    color: '#FF9800',
    lessons: [
      {
        id: 'social-1',
        title: 'Community Helpers',
        description: 'Learn about different community roles',
        duration: '15 min',
        progress: 30,
        difficulty: 'Beginner',
        icon: 'account-group',
        subject: 'Social Studies',
        arEnabled: true,
        learningObjectives: ['Identify community helpers', 'Understand their roles'],
        keyConcepts: ['Community', 'Helpers', 'Roles'],
        activities: ['Role play', 'Helper matching'],
        vocabulary: ['Community', 'Helper', 'Role', 'Service'],
        _id: 'social-1',
        color: '#FF9800'
      }
    ]
  },
  Music: {
    id: 'music',
    title: 'Music',
    description: 'Explore musical concepts',
    icon: 'music',
    color: '#E91E63',
    lessons: [
      {
        id: 'music-1',
        title: 'Rhythm Basics',
        description: 'Learn about musical rhythm',
        duration: '10 min',
        progress: 0,
        difficulty: 'Beginner',
        icon: 'music',
        subject: 'Music',
        arEnabled: false,
        learningObjectives: ['Basic rhythm patterns', 'Beat recognition'],
        keyConcepts: ['Beat', 'Rhythm', 'Tempo'],
        activities: ['Clapping exercises', 'Rhythm games'],
        vocabulary: ['Beat', 'Rhythm', 'Tempo', 'Pattern'],
        _id: 'music-1',
        color: '#E91E63'
      }
    ]
  },
  Art: {
    id: 'art',
    title: 'Art',
    description: 'Express creativity through art',
    icon: 'palette',
    color: '#3F51B5',
    lessons: [
      {
        id: 'art-1',
        title: 'Color Theory',
        description: 'Learn about colors and their combinations',
        duration: '15 min',
        progress: 0,
        difficulty: 'Beginner',
        icon: 'palette',
        subject: 'Art',
        arEnabled: false,
        learningObjectives: ['Primary colors', 'Color mixing'],
        keyConcepts: ['Primary Colors', 'Secondary Colors', 'Color Wheel'],
        activities: ['Color mixing', 'Rainbow painting'],
        vocabulary: ['Primary', 'Secondary', 'Mix', 'Color'],
        _id: 'art-1',
        color: '#3F51B5'
      }
    ]
  }
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