import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_CONFIG } from '../../config/api';

// Define types based on your API response
export interface ARModel {
  _id: string;
  name: string;
  description: string;
  modelFile: string;
  fileType: string;
  previewImage: string;
  module: {
    _id: string;
    title: string;
  };
  scale: {
    x: number;
    y: number;
    z: number;
  };
  rotation: {
    x: number;
    y: number;
    z: number;
  };
  textures: string[];
  createdAt: string;
}

interface ARModelsState {
  models: ARModel[];
  loading: boolean;
  error: string | null;
  selectedModel: ARModel | null;
}

const initialState: ARModelsState = {
  models: [],
  loading: false,
  error: null,
  selectedModel: null,
};

// Create async thunk for fetching AR models
export const fetchARModels = createAsyncThunk(
  'arModels/fetchARModels',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ALL_AR_MODELS}`);
      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch AR models';
      return rejectWithValue(message);
    }
  }
);

const arModelsSlice = createSlice({
  name: 'arModels',
  initialState,
  reducers: {
    selectModel: (state, action) => {
      state.selectedModel = action.payload;
    },
    clearSelectedModel: (state) => {
      state.selectedModel = null;
    },
    setModels: (state, action) => {
      state.models = action.payload;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchARModels.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchARModels.fulfilled, (state, action) => {
        state.loading = false;
        state.models = action.payload;
      })
      .addCase(fetchARModels.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { selectModel, clearSelectedModel, setModels } = arModelsSlice.actions;

export default arModelsSlice.reducer; 