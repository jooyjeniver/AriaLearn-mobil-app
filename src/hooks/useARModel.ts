import { useState, useEffect } from 'react';
import api from '../services/api';

interface ARModel {
  id: string;
  url: string;
  name: string;
  type: string;
  scale: number;
}

export const useARModel = (modelId?: string) => {
  const [model, setModel] = useState<ARModel | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  const loadModel = async () => {
    if (!modelId) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await api.get(`/ar/models/${modelId}`);
      if (response.data) {
        setModel(response.data);
        setRetryCount(0);
      }
    } catch (err) {
      console.error('Error loading AR model:', err);
      setError('Failed to load 3D model');
      
      // Retry logic
      if (retryCount < MAX_RETRIES) {
        setRetryCount(prev => prev + 1);
        setTimeout(loadModel, 1000 * (retryCount + 1)); // Exponential backoff
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (modelId) {
      loadModel();
    }
  }, [modelId]);

  const retry = () => {
    setRetryCount(0);
    loadModel();
  };

  return {
    model,
    isLoading,
    error,
    retry,
    retryCount,
  };
}; 