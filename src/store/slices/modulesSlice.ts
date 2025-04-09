import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { Difficulty } from '../../types/lessons';
import api from '../../api/axios';
import { API_CONFIG } from '../../config/api';

export interface Lesson {
  id: string;
  title: string;
  description: string;
  duration: string;
  progress: number;
  difficulty: Difficulty;
  icon: string;
  subject: string;
  arEnabled: boolean;
  learningObjectives: string[];
  keyConcepts: string[];
  activities: string[];
  vocabulary: string[];
  _id: string;
  color?: string;
}

export interface Module {
  _id: string;
  title: string;
  description: string;
  content: string;
  order: number;
  icon: string;
  color: string;
  lessons: Lesson[];
  arModels: any[];
  resources: any[];
  quizzes: any[];
  createdAt: string;
  __v: number;
}

interface ModulesState {
  modules: Module[];
  loading: boolean;
  error: string | null;
}

const initialState: ModulesState = {
  modules: [],
  loading: false,
  error: null,
};

export const fetchModules = createAsyncThunk(
  'modules/fetchModules',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/modules');
      return response.data.data;
    } catch (error: any) {
      if (error.response) {
        return rejectWithValue(error.response.data.message || 'Failed to fetch modules');
      }
      return rejectWithValue('An unexpected error occurred');
    }
  }
);

const modulesSlice = createSlice({
  name: 'modules',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchModules.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchModules.fulfilled, (state, action) => {
        state.loading = false;
        state.modules = action.payload;
      })
      .addCase(fetchModules.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const selectModules = (state: RootState) => state.modules.modules;
export const selectModulesLoading = (state: RootState) => state.modules.loading;
export const selectModulesError = (state: RootState) => state.modules.error;

export default modulesSlice.reducer; 