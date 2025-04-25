import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { EmotionAnalysisResponse } from '../../services/emotionAnalysisService';

interface EmotionState {
  currentAnalysis: EmotionAnalysisResponse | null;
  analysisHistory: EmotionAnalysisResponse[];
  isAnalyzing: boolean;
  error: string | null;
}

const initialState: EmotionState = {
  currentAnalysis: null,
  analysisHistory: [],
  isAnalyzing: false,
  error: null,
};

const emotionSlice = createSlice({
  name: 'emotion',
  initialState,
  reducers: {
    setCurrentAnalysis: (state, action: PayloadAction<EmotionAnalysisResponse>) => {
      if (action.payload?.data) {
        state.currentAnalysis = action.payload;
        state.analysisHistory.push(action.payload);
        state.isAnalyzing = false;
        state.error = null;
      }
    },
    setIsAnalyzing: (state, action: PayloadAction<boolean>) => {
      state.isAnalyzing = action.payload;
      if (action.payload) {
        state.error = null;
      }
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isAnalyzing = false;
    },
    clearCurrentAnalysis: (state) => {
      state.currentAnalysis = null;
      state.error = null;
    },
    clearHistory: (state) => {
      state.analysisHistory = [];
    },
  },
});

export const {
  setCurrentAnalysis,
  setIsAnalyzing,
  setError,
  clearCurrentAnalysis,
  clearHistory,
} = emotionSlice.actions;

export default emotionSlice.reducer; 