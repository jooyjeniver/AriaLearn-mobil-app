export interface Module {
  id: string;
  name: string;
  icon: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  category: string;
  lessons: string[];
  progress?: number;
  completed?: boolean;
  color?: string;
} 