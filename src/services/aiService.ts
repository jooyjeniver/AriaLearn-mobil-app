import api from './api';
import { API_CONFIG } from '../config/api';

export interface EmotionAnalysisInput {
  text?: string;
  imageUrl?: string;
}

export interface EmotionAnalysisResult {
  emotion: string;
  confidence: number;
  suggestions: string[];
  // Add other analysis fields as needed
}

export interface QuizGenerationParams {
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  numQuestions: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  // Add other question fields as needed
}

export interface GameStrategyParams {
  gameType: string;
  userLevel: string;
  preferences: {
    [key: string]: any;
  };
}

export interface Recommendation {
  id: string;
  type: string; // 'lesson', 'module', 'resource', etc.
  title: string;
  description: string;
  relevanceScore: number;
  // Add other recommendation fields as needed
}

export interface GameStrategy {
  difficulty: string;
  focusAreas: string[];
  suggestedModules: string[];
  estimatedDuration: number; // in minutes
  // Add other strategy fields as needed
}

class AIService {
  private static instance: AIService;

  private constructor() {}

  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  // Analyze emotion from text/image
  async analyzeEmotion(data: { text?: string; imageUrl?: string }): Promise<EmotionAnalysisResult> {
    try {
      const response = await api.post<EmotionAnalysisResult>(API_CONFIG.ENDPOINTS.ANALYZE_EMOTION, data);
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to analyze emotion: ${error.message}`);
      }
      throw new Error('Failed to analyze emotion: An unexpected error occurred');
    }
  }

  // Generate quiz
  async generateQuiz(params: { topic: string; difficulty: string; count: number }): Promise<QuizQuestion[]> {
    try {
      const response = await api.post<QuizQuestion[]>(API_CONFIG.ENDPOINTS.GENERATE_QUIZ, params);
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to generate quiz: ${error.message}`);
      }
      throw new Error('Failed to generate quiz: An unexpected error occurred');
    }
  }

  // Get personalized recommendations
  async getRecommendations(): Promise<Recommendation[]> {
    try {
      const response = await api.get<Recommendation[]>(API_CONFIG.ENDPOINTS.GET_RECOMMENDATIONS);
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to get recommendations: ${error.message}`);
      }
      throw new Error('Failed to get recommendations: An unexpected error occurred');
    }
  }

  // Generate game strategy
  async generateGameStrategy(params: { userLevel: string; focusAreas?: string[] }): Promise<GameStrategy> {
    try {
      const response = await api.post<GameStrategy>(API_CONFIG.ENDPOINTS.GENERATE_GAME_STRATEGY, params);
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to generate game strategy: ${error.message}`);
      }
      throw new Error('Failed to generate game strategy: An unexpected error occurred');
    }
  }
}

export const aiService = AIService.getInstance(); 