import api, { API_CONFIG } from './api';

export interface ARModel {
  id: string;
  name: string;
  description: string;
  modelUrl: string;
  thumbnailUrl: string;
  category: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  // Add other model fields as needed
}

export interface CreateARModelData {
  name: string;
  description: string;
  modelUrl: string;
  thumbnailUrl: string;
  category: string;
  tags: string[];
}

class ARModelService {
  private static instance: ARModelService;

  private constructor() {}

  static getInstance(): ARModelService {
    if (!ARModelService.instance) {
      ARModelService.instance = new ARModelService();
    }
    return ARModelService.instance;
  }

  // Get all AR models
  async getAllModels(): Promise<ARModel[]> {
    try {
      const response = await api.get<ARModel[]>(API_CONFIG.ENDPOINTS.ALL_AR_MODELS);
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to get all AR models: ${error.message}`);
      }
      throw new Error('Failed to get all AR models: An unexpected error occurred');
    }
  }

  // Create new AR model (Admin only)
  async createModel(data: CreateARModelData): Promise<ARModel> {
    try {
      const response = await api.post<ARModel>(API_CONFIG.ENDPOINTS.CREATE_AR_MODEL, data);
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to create AR model: ${error.message}`);
      }
      throw new Error('Failed to create AR model: An unexpected error occurred');
    }
  }

  // Get AR model by ID
  async getModelById(id: string): Promise<ARModel> {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.AR_MODEL_BY_ID.replace(':id', id);
      const response = await api.get<ARModel>(endpoint);
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to get AR model by ID: ${error.message}`);
      }
      throw new Error('Failed to get AR model by ID: An unexpected error occurred');
    }
  }

  // Update AR model (Admin only)
  async updateModel(id: string, data: Partial<CreateARModelData>): Promise<ARModel> {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.UPDATE_AR_MODEL.replace(':id', id);
      const response = await api.put<ARModel>(endpoint, data);
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to update AR model: ${error.message}`);
      }
      throw new Error('Failed to update AR model: An unexpected error occurred');
    }
  }

  // Delete AR model (Admin only)
  async deleteModel(id: string): Promise<void> {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.DELETE_AR_MODEL.replace(':id', id);
      await api.delete(endpoint);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to delete AR model: ${error.message}`);
      }
      throw new Error('Failed to delete AR model: An unexpected error occurred');
    }
  }
}

export const arModelService = ARModelService.getInstance(); 