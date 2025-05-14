import { useState, useCallback } from 'react';
import { Platform } from 'react-native';
import axios from 'axios';
import RNFS from 'react-native-fs';
import { useDispatch } from 'react-redux';
import { setEmotionData as setReduxEmotionData } from '../store/slices/emotionSlice';
import { API, TIMEOUTS, API_CONFIG } from '../config/api';

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

// Generate mock data for fallback when API fails
const generateMockData = (): EmotionData => {
  console.log('Generating mock emotion data');
  
  return {
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
};

// Add a retry utility function after the generateMockData function
// Retry function with exponential backoff
const retryApiCall = async (apiCall, maxRetries = API_CONFIG.RETRY_ATTEMPTS) => {
  let lastError;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      console.log(`API call attempt ${attempt + 1} of ${maxRetries}`);
      return await apiCall();
    } catch (error) {
      console.log(`Attempt ${attempt + 1} failed:`, error.message);
      lastError = error;
      
      // Check if we should retry
      if (attempt < maxRetries - 1) {
        // Exponential backoff with jitter
        const delay = Math.min(
          Math.pow(2, attempt) * API_CONFIG.RETRY_DELAY, 
          10000
        ) * (0.8 + Math.random() * 0.4); // Add 20% jitter
        
        console.log(`Retrying in ${Math.round(delay)}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
};

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
      
      console.log('Starting face analysis...');
      
      // Create a properly formatted base64 image
      const formattedBase64 = base64Data.startsWith('data:') ? base64Data : `data:image/jpeg;base64,${base64Data}`;
      
      console.log('Making API request to:', API.EMOTION_API);
      
      // Use retry logic for the API call
      const response = await retryApiCall(() => axios.post(
        API.EMOTION_API,
        { 
          image: formattedBase64
        },
        {
          headers: API_CONFIG.HEADERS,
          timeout: TIMEOUTS.LONG
        }
      ));
      
      console.log('API response received:', response.status);
      
      // Process the response and update state
      if (response.data) {
        dispatch(setReduxEmotionData({
          emotionData: response.data,
          isMockData: false
        }));
        
        setEmotionData(response.data);
        setIsMockData(false);
        setLoading(false);
        return response.data;
      } else {
        throw new Error('No data received from API');
      }
    } catch (error) {
      console.error('Error analyzing emotion:', error);
      
      // Log detailed error information
      if (axios.isAxiosError(error)) {
        console.log('Network error details:', {
          message: error.message,
          code: error.code,
          response: error.response ? {
            status: error.response.status,
            data: error.response.data
          } : 'No response received',
          request: error.request ? 'Request was made but no response received' : 'Request setup error'
        });
      }
      
      setError(error);
      
      // Fall back to mock data if API fails
      console.log('Falling back to mock data due to API error');
      const mockData = generateMockData();
      
      dispatch(setReduxEmotionData({
        emotionData: mockData,
        isMockData: true
      }));
      
      setEmotionData(mockData);
      setIsMockData(true);
      setLoading(false);
      
      return mockData;
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