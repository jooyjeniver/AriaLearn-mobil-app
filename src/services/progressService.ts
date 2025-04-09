import api, { API_CONFIG } from './api';

export interface OverallProgress {
  totalLessons: number;
  completedLessons: number;
  totalModules: number;
  completedModules: number;
  overallPercentage: number;
  // Add other progress fields as needed
}

export interface LessonProgress {
  lessonId: string;
  completed: boolean;
  score?: number;
  timeSpent: number; // in seconds
  lastAccessed: string;
  // Add other lesson progress fields as needed
}

export interface EmotionalData {
  lessonId: string;
  timestamp: string;
  emotion: string;
  intensity: number; // 1-10
  notes?: string;
  // Add other emotional data fields as needed
}

export interface EmotionalSummary {
  totalSessions: number;
  emotions: {
    [key: string]: number; // emotion: count
  };
  averageIntensity: number;
  // Add other summary fields as needed
}

class ProgressService {
  private static instance: ProgressService;

  private constructor() {}

  static getInstance(): ProgressService {
    if (!ProgressService.instance) {
      ProgressService.instance = new ProgressService();
    }
    return ProgressService.instance;
  }

  // Get overall progress
  async getOverallProgress(): Promise<OverallProgress> {
    try {
      const response = await api.get<OverallProgress>(API_CONFIG.ENDPOINTS.OVERALL_PROGRESS);
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to get overall progress: ${error.message}`);
      }
      throw new Error('Failed to get overall progress: An unexpected error occurred');
    }
  }

  // Update lesson progress
  async updateLessonProgress(data: LessonProgress): Promise<LessonProgress> {
    try {
      const response = await api.post<LessonProgress>(API_CONFIG.ENDPOINTS.UPDATE_LESSON_PROGRESS, data);
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to update lesson progress: ${error.message}`);
      }
      throw new Error('Failed to update lesson progress: An unexpected error occurred');
    }
  }

  // Add emotional data
  async addEmotionalData(data: EmotionalData): Promise<EmotionalData> {
    try {
      const response = await api.post<EmotionalData>(API_CONFIG.ENDPOINTS.ADD_EMOTIONAL_DATA, data);
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to add emotional data: ${error.message}`);
      }
      throw new Error('Failed to add emotional data: An unexpected error occurred');
    }
  }

  // Get emotional summary
  async getEmotionalSummary(): Promise<EmotionalSummary> {
    try {
      const response = await api.get<EmotionalSummary>(API_CONFIG.ENDPOINTS.GET_EMOTIONAL_SUMMARY);
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to get emotional summary: ${error.message}`);
      }
      throw new Error('Failed to get emotional summary: An unexpected error occurred');
    }
  }
}

export const progressService = ProgressService.getInstance(); 