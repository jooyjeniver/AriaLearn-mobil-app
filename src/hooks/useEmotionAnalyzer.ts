import { useState, useCallback } from 'react';
import { Platform } from 'react-native';
import axios from 'axios';
import RNFS from 'react-native-fs';
import { useDispatch } from 'react-redux';
import { setEmotionData as setReduxEmotionData } from '../store/slices/emotionSlice';

// Types for emotion data
export interface EmotionValues {
  happiness: number;
  neutral: number;
  surprise: number;
  sadness: number;
  anger: number;
  disgust: number;
  fear: number;
}

export interface FaceData {
  emotions: EmotionValues;
  dominantEmotion: string;
}

export interface EmotionData {
  totalFaces: number;
  dominantEmotion: string;
  faces: FaceData[];
}

export interface EmotionApiResponse {
  success: boolean;
  data: EmotionData;
}

export const useEmotionAnalyzer = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emotionData, setEmotionData] = useState<EmotionData | null>(null);
  const [isMockData, setIsMockData] = useState(false);
  const dispatch = useDispatch();
  
  // Helper function to convert image file to base64
  const getBase64FromPath = async (path: string): Promise<string> => {
    try {
      const base64Data = await RNFS.readFile(path, 'base64');
      return base64Data;
    } catch (e) {
      console.error('Failed to read file', e);
      throw new Error('Failed to read image file');
    }
  };

  // Function to analyze emotion from image
  const analyzeEmotion = useCallback(async (imagePath: string) => {
    setLoading(true);
    setError(null);

    try {
      // Remove 'file://' prefix for iOS
      const cleanPath = Platform.OS === 'ios' 
        ? imagePath.replace('file://', '') 
        : imagePath;
      
      // Get base64 data from image
      const base64Data = await getBase64FromPath(cleanPath);
      
      // Make API call
      const response = await axios.post(
        'http://localhost:5000/api/emotion/analyze-base64',
        { base64: base64Data },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 10000 // 10 second timeout
        }
      );

      // Process response
      if (response.data && response.data.success) {
        setEmotionData(response.data.data);
        dispatch(setReduxEmotionData({ 
          emotionData: response.data.data,
          isMockData: false
        }));
        setIsMockData(false);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (e: any) {
      console.error('Error analyzing emotion:', e);
      
      // For demo purposes: use mock data if API fails
      if (e.message.includes('Network Error') || e.message.includes('timeout') || e.code === 'ECONNREFUSED') {
        console.log('Using mock data due to network error');
        
        // Mock data for demonstration
        const mockData: EmotionData = {
          totalFaces: 1,
          dominantEmotion: 'happiness',
          faces: [
            {
              emotions: {
                happiness: 73.425,
                neutral: 15.55,
                surprise: 7.718,
                sadness: 2.205,
                anger: 0.441,
                disgust: 0.331,
                fear: 0.331
              },
              dominantEmotion: 'happiness'
            }
          ]
        };
        
        setEmotionData(mockData);
        dispatch(setReduxEmotionData({ 
          emotionData: mockData,
          isMockData: true
        }));
        setIsMockData(true);
      } else {
        setError(e.message || 'Unknown error occurred');
        
        // Retry after 3 seconds
        setTimeout(() => {
          if (!emotionData) {
            retry();
          }
        }, 3000);
      }
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  // Function to retry analysis
  const retry = useCallback(() => {
    setError(null);
    setEmotionData(null);
    setIsMockData(false);
  }, []);

  return {
    analyzeEmotion,
    loading,
    error,
    emotionData,
    isMockData,
    retry
  };
};

export default useEmotionAnalyzer; 