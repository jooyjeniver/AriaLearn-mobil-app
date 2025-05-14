import api, { API_CONFIG } from './api';

export interface Lesson {
  _id: string;
  title: string;
  description: string;
  icon?: string;
  // Add other lesson fields as needed
}

export interface LessonDetail {
  id: string;
  title: string;
  description: string;
  duration: string;
  progress: number;
  difficulty: string;
  icon: string;
  subject: string;
  arEnabled: boolean;
  youtubeLink?: string;
  images: string[];
  content: string;
  quizzes: any[];
}

export interface CreateLessonData {
  title: string;
  description: string;
  content: string;
  moduleId: string;
  order: number;
  duration: number;
}

class LessonService {
  private static instance: LessonService;

  private constructor() {}

  static getInstance(): LessonService {
    if (!LessonService.instance) {
      LessonService.instance = new LessonService();
    }
    return LessonService.instance;
  }

  // Get all lessons
  async getAllLessons(): Promise<Lesson[]> {
    try {
      const response = await api.get<Lesson[]>(API_CONFIG.ENDPOINTS.ALL_LESSONS);
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to get all lessons: ${error.message}`);
      }
      throw new Error('Failed to get all lessons: An unexpected error occurred');
    }
  }

  // Create new lesson (Admin only)
  async createLesson(data: CreateLessonData): Promise<Lesson> {
    try {
      const response = await api.post<Lesson>(API_CONFIG.ENDPOINTS.CREATE_LESSON, data);
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to create lesson: ${error.message}`);
      }
      throw new Error('Failed to create lesson: An unexpected error occurred');
    }
  }

  // Get lesson by ID
  async getLessonById(id: string): Promise<Lesson> {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.LESSON_BY_ID.replace(':id', id);
      const response = await api.get<Lesson>(endpoint);
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to get lesson by ID: ${error.message}`);
      }
      throw new Error('Failed to get lesson by ID: An unexpected error occurred');
    }
  }

  // Update lesson (Admin only)
  async updateLesson(id: string, data: Partial<CreateLessonData>): Promise<Lesson> {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.UPDATE_LESSON.replace(':id', id);
      const response = await api.put<Lesson>(endpoint, data);
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to update lesson: ${error.message}`);
      }
      throw new Error('Failed to update lesson: An unexpected error occurred');
    }
  }

  // Delete lesson (Admin only)
  async deleteLesson(id: string): Promise<void> {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.DELETE_LESSON.replace(':id', id);
      await api.delete(endpoint);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to delete lesson: ${error.message}`);
      }
      throw new Error('Failed to delete lesson: An unexpected error occurred');
    }
  }

  // Get lesson details with extended information
  async getLessonDetail(id: string): Promise<LessonDetail> {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.LESSON_DETAIL.replace(':id', id);
      const response = await api.get<{ success: boolean, data: LessonDetail }>(endpoint);
      return response.data.data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to get lesson detail: ${error.message}`);
      }
      throw new Error('Failed to get lesson detail: An unexpected error occurred');
    }
  }
}

export const lessonService = LessonService.getInstance(); 