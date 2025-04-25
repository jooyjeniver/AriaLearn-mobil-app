import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { API_CONFIG } from '../../config/api';
import api from '../../services/api';

interface Scale {
  x: number;
  y: number;
  z: number;
}

interface Rotation {
  x: number;
  y: number;
  z: number;
}

interface Module {
  _id: string;
  title: string;
}

export interface ARModel {
  _id: string;
  name: string;
  description: string;
  modelFile: string;
  fileType: string;
  previewImage: string;
  module: Module;
  subject: string;
  isSample: boolean;
  category: string;
  complexity: string;
  scale: Scale;
  rotation: Rotation;
  textures: string[];
  createdAt: string;
}

interface ARModelsState {
  models: ARModel[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  selectedModel: string | null;
}

const initialState: ARModelsState = {
  models: [],
  status: 'idle',
  error: null,
  selectedModel: null,
};

export const fetchARModels = createAsyncThunk(
  'arModels/fetchARModels',
  async (_, { rejectWithValue }) => {
    try {
      console.log('Fetching AR models from:', `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AR_MODELS}`);
      const response = await api.get(API_CONFIG.ENDPOINTS.AR_MODELS);
      // Validate response data structure
      if (!response.data || typeof response.data !== 'object') {
        console.error('Invalid response data:', response.data);
        throw new Error('Invalid response format from server');
      }

      // Handle paginated response structure
      const models = response.data.data;
      
      if (!Array.isArray(models)) {
        console.error('Invalid models data:', models);
        throw new Error('Invalid models format from server');
      }

      console.log('Fetched models:', {
        count: response.data.count,
        success: response.data.success,
        modelsCount: models.length
      });

      // Transform the model data to ensure all required fields are present
      // and convert relative URLs to absolute URLs
      const transformedModels = models.map(model => ({
        ...model,
        modelFile: model.modelFile.startsWith('http') 
          ? model.modelFile 
          : `${API_CONFIG.BASE_URL}${model.modelFile}`,
        previewImage: model.previewImage 
          ? (model.previewImage.startsWith('http') 
              ? model.previewImage 
              : `${API_CONFIG.BASE_URL}${model.previewImage}`)
          : '',
        scale: model.scale || { x: 1, y: 1, z: 1 },
        rotation: model.rotation || { x: 0, y: 0, z: 0 },
        module: model.module || { _id: '', title: '' },
        textures: Array.isArray(model.textures) ? model.textures.map(texture => 
          texture.startsWith('http') ? texture : `${API_CONFIG.BASE_URL}${texture}`
        ) : [],
        category: model.category || 'other',
        complexity: model.complexity || 'basic',
        isSample: Boolean(model.isSample)
      }));

      return transformedModels;
    } catch (error: any) {
      console.error('Error fetching AR models:', error);
      return rejectWithValue(
        error.response?.data?.message || 
        error.message || 
        'Failed to fetch AR models'
      );
    }
  }
);

const arModelsSlice = createSlice({
  name: 'arModels',
  initialState,
  reducers: {
    setSelectedModel: (state, action: PayloadAction<string>) => {
      const modelExists = state.models.some(model => model.name === action.payload);
      if (modelExists) {
        state.selectedModel = action.payload;
        state.error = null;
      } else {
        state.error = 'Selected model not found';
      }
    },
    clearModels: (state) => {
      state.models = [];
      state.selectedModel = null;
      state.error = null;
      state.status = 'idle';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchARModels.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchARModels.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.models = Array.isArray(action.payload) ? action.payload : [];
        state.error = null;
        
        // If there's no selected model but we have models, select the first one
        if (!state.selectedModel && state.models.length > 0) {
          state.selectedModel = state.models[0].name;
        }
      })
      .addCase(fetchARModels.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string || 'Failed to fetch models';
        state.models = []; // Reset models on error
        state.selectedModel = null; // Clear selected model on error
      });
  },
});

export const { setSelectedModel, clearModels } = arModelsSlice.actions;
export default arModelsSlice.reducer; 