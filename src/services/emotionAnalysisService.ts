import api from './api';

export interface EmotionAnalysisResponse {
  success: boolean;
  data: {
    emotions: {
      joy: number;
      sadness: number;
      anger: number;
      fear: number;
      surprise: number;
      neutral: number;
    };
    dominantEmotion: string;
    confidence: number;
    analysis: string;
    suggestions: string[];
  };
}

export const analyzeEmotion = async (imageUri: string): Promise<EmotionAnalysisResponse> => {
  try {
    const formData = new FormData();
    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'emotion_image.jpg',
    } as any); // Type assertion to any for React Native's FormData

    const response = await api.post('/api/ai/analyze-emotion', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error analyzing emotion:', error);
    throw error;
  }
}; 