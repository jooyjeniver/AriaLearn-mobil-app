// src/store/slices/quizSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_CONFIG } from '../../config/api';

// Define types for API response
export interface APIQuizQuestion {
  _id: string;
  questionText: string;
  options: Array<{ text: string; isCorrect: boolean; _id: string }>;
  explanation: string;
}

export interface APIQuiz {
  _id: string;
  title: string;
  description: string;
  topic: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  questions: APIQuizQuestion[];
  __v?: number;
}

// Define types for app usage
export interface QuizQuestion {
  id: string;
  text: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  subject: string;
  icon: string;
  color: string;
  questions: QuizQuestion[];
}

interface QuizState {
  quizzes: APIQuiz[];  // Changed to store raw API response
  selectedQuiz: Quiz | null;  // Transformed for usage
  currentQuestion: number;
  userAnswers: Array<{ selectedOption: number; isCorrect: boolean }>;
  loading: boolean;
  error: string | null;
  success: boolean;
}

// Initial state
const initialState: QuizState = {
  quizzes: [],
  selectedQuiz: null,
  currentQuestion: 0,
  userAnswers: [],
  loading: false,
  error: null,
  success: false,
};

const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Transform API quiz to app quiz format
const transformQuiz = (apiQuiz: APIQuiz): Quiz => {
  const questions = apiQuiz.questions.map(q => {
    // Find the index of the correct option
    const correctAnswerIndex = q.options.findIndex(opt => opt.isCorrect);
    
    return {
      id: q._id,
      text: q.questionText,
      options: q.options.map(opt => opt.text),
      correctAnswerIndex: correctAnswerIndex >= 0 ? correctAnswerIndex : 0,
      explanation: q.explanation
    };
  });

  return {
    id: apiQuiz._id,
    title: apiQuiz.title,
    description: apiQuiz.description,
    difficulty: apiQuiz.difficulty === 'beginner' ? 'Easy' : 
                apiQuiz.difficulty === 'intermediate' ? 'Medium' : 'Hard',
    subject: apiQuiz.topic,
    icon: 'help-circle',  // Default icon
    color: '#9C27B0',     // Default color
    questions
  };
};

// Async thunks
export const fetchQuizzes = createAsyncThunk(
  'quiz/fetchQuizzes',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(API_CONFIG.ENDPOINTS.QUIZZES);
      console.log("API response structure:", response.data);
      // The API returns { success: true, count: 5, data: [...] }
      // We need to return the data array
      return response.data.data || [];
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch quizzes';
      console.log("error", error);
      return rejectWithValue(message);
    }
  }
);

// Save quiz results
export const saveQuizResults = createAsyncThunk(
  'quiz/saveResults',
  async (data: { quizId: string; score: number; answers: any[] }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_CONFIG.BASE_URL}/api/quizzes/results`, data);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to save quiz results';
      return rejectWithValue(message);
    }
  }
);

// Quiz slice
const quizSlice = createSlice({
  name: 'quiz',
  initialState,
  reducers: {
    // Reset state
    resetQuizState: (state) => {
      return initialState;
    },
    
    // Select a quiz to play
    selectQuiz: (state, action: PayloadAction<APIQuiz>) => {
      // Transform the API quiz into our application format
      state.selectedQuiz = transformQuiz(action.payload);
      state.currentQuestion = 0;
      state.userAnswers = [];
      state.error = null;
    },
    
    // Record an answer to a question
    answerQuestion: (state, action: PayloadAction<{ 
      questionIndex: number; 
      selectedOption: number; 
      isCorrect: boolean 
    }>) => {
      const { questionIndex, selectedOption, isCorrect } = action.payload;
      state.userAnswers[questionIndex] = { selectedOption, isCorrect };
    },
    
    // Move to the next question
    nextQuestion: (state) => {
      if (state.selectedQuiz && state.currentQuestion < state.selectedQuiz.questions.length - 1) {
        state.currentQuestion += 1;
      }
    },
    
    // Reset the current quiz (but keep the quizzes list)
    resetCurrentQuiz: (state) => {
      state.currentQuestion = 0;
      state.userAnswers = [];
      state.error = null;
    },
    
    // Clear any error messages
    clearQuizError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // Fetch quizzes cases
    builder
      .addCase(fetchQuizzes.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(fetchQuizzes.fulfilled, (state, action: PayloadAction<APIQuiz[]>) => {
        state.loading = false;
        state.quizzes = action.payload;
        state.success = true;
      })
      .addCase(fetchQuizzes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.success = false;
      })
      
      // Save quiz results cases
      .addCase(saveQuizResults.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveQuizResults.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(saveQuizResults.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// Export actions and reducer
export const { 
  resetQuizState,
  selectQuiz, 
  answerQuestion, 
  nextQuestion, 
  resetCurrentQuiz,
  clearQuizError
} = quizSlice.actions;

export default quizSlice.reducer;