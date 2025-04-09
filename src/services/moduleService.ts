import api, { API_CONFIG } from './api';

export interface ModuleProgress {
  moduleId: string;
  completed: boolean;
  progress: number; // 0-100
  lastAccessed: string;
  // Add other progress fields as needed
}

export interface ModuleResource {
  id: string;
  title: string;
  type: string; // 'video', 'pdf', 'link', etc.
  url: string;
  // Add other resource fields as needed
}

export interface ARModel {
  id: string;
  name: string;
  modelUrl: string;
  thumbnailUrl: string;
  // Add other model fields as needed
}

class ModuleService {
  private static instance: ModuleService;

  private constructor() {}

  static getInstance(): ModuleService {
    if (!ModuleService.instance) {
      ModuleService.instance = new ModuleService();
    }
    return ModuleService.instance;
  }

  // Get user module progress
  async getModuleProgress(): Promise<ModuleProgress[]> {
    try {
      const response = await api.get<ModuleProgress[]>(API_CONFIG.ENDPOINTS.MODULE_PROGRESS);
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to get module progress: ${error.message}`);
      }
      throw new Error('Failed to get module progress: An unexpected error occurred');
    }
  }

  // Add resources to module
  async addModuleResources(moduleId: string, resources: ModuleResource[]): Promise<ModuleResource[]> {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.ADD_MODULE_RESOURCES.replace(':id', moduleId);
      const response = await api.post<ModuleResource[]>(endpoint, { resources });
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to add module resources: ${error.message}`);
      }
      throw new Error('Failed to add module resources: An unexpected error occurred');
    }
  }

  // Add AR models to module
  async addModuleModels(moduleId: string, models: ARModel[]): Promise<ARModel[]> {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.ADD_MODULE_MODELS.replace(':id', moduleId);
      const response = await api.post<ARModel[]>(endpoint, { models });
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to add module models: ${error.message}`);
      }
      throw new Error('Failed to add module models: An unexpected error occurred');
    }
  }

  // Update user module progress
  async updateModuleProgress(moduleId: string, progress: number): Promise<ModuleProgress> {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.UPDATE_MODULE_PROGRESS.replace(':id', moduleId);
      const response = await api.put<ModuleProgress>(endpoint, { progress });
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to update module progress: ${error.message}`);
      }
      throw new Error('Failed to update module progress: An unexpected error occurred');
    }
  }
}

export const moduleService = ModuleService.getInstance(); 