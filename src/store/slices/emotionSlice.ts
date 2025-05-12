import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { EmotionData } from '../../hooks/useEmotionAnalyzer';

interface EmotionState {
  emotionData: EmotionData | null;
  isMockData: boolean;
  lastCaptureTimestamp: number | null;
  history: {
    timestamp: number;
    dominantEmotion: string;
    dominantEmotionValue: number;
  }[];
}

interface SetEmotionDataPayload {
  emotionData: EmotionData;
  isMockData: boolean;
}

const initialState: EmotionState = {
  emotionData: null,
  isMockData: false,
  lastCaptureTimestamp: null,
  history: [],
};

const emotionSlice = createSlice({
  name: 'emotion',
  initialState,
  reducers: {
    setEmotionData: (state, action: PayloadAction<SetEmotionDataPayload>) => {
      const { emotionData, isMockData } = action.payload;
      state.emotionData = emotionData;
      state.isMockData = isMockData;
      state.lastCaptureTimestamp = Date.now();
      
      // Add to history if there's at least one face
      if (emotionData.totalFaces > 0 && emotionData.faces.length > 0) {
        const face = emotionData.faces[0];
        const dominantEmotion = face.dominantEmotion;
        const dominantEmotionValue = face.emotions[dominantEmotion as keyof typeof face.emotions];
        
        state.history.push({
          timestamp: Date.now(),
          dominantEmotion,
          dominantEmotionValue,
        });
        
        // Limit history to last 20 entries
        if (state.history.length > 20) {
          state.history = state.history.slice(-20);
        }
      }
    },
    
    clearEmotionData: (state) => {
      state.emotionData = null;
      state.isMockData = false;
    },
    
    clearHistory: (state) => {
      state.history = [];
    }
  },
});

export const { setEmotionData, clearEmotionData, clearHistory } = emotionSlice.actions;

export default emotionSlice.reducer; 