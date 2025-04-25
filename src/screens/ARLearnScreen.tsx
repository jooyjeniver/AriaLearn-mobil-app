import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image as RNImage,
  SafeAreaView,
  ScrollView,
  Modal,
  Dimensions,
  Platform,
  ActivityIndicator,
  Alert,
  Animated as RNAnimated,
} from 'react-native';
import {
  ViroARScene,
  ViroARSceneNavigator,
  ViroNode,
  ViroText,
  ViroTrackingStateConstants,
  ViroTrackingReason as ViroTrackingReasonType,
  Viro3DObject,
  ViroAmbientLight,
  ViroSpotLight,
  ViroAnimations,
  ViroTrackingState,
} from '@reactvision/react-viro';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import ErrorBoundary from '../components/ErrorBoundary';
import LinearGradient from 'react-native-linear-gradient';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { fetchARModels, setSelectedModel } from '../store/slices/arModelsSlice';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { API_CONFIG } from '../config/api';

interface ModelCardProps {
  title: string;
  iconName: string;
  isSelected: boolean;
  onPress: () => void;
}

interface ModelTransitionProps {
  isVisible: boolean;
  model: React.ReactNode;
  style: any;
  children?: React.ReactNode;
}

// Update screen dimensions and add constants for layout
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const MODEL_PANEL_HEIGHT = SCREEN_HEIGHT * 0.35;
const MODEL_CARD_WIDTH = 160;
const MODEL_CARD_HEIGHT = 290;
const MODEL_PREVIEW_SIZE = 50;
const DEFAULT_MODEL_SCALE = 0.7;

// Add this after the screen dimensions


// Helper function to get icon based on category
const getCategoryIcon = (category: string): string => {
  const categoryIcons: { [key: string]: string } = {
    'Space': 'planet',
    'Animals': 'paw',
    'Human Body': 'human',
    'Plants': 'flower',
    'Chemistry': 'flask',
    'Physics': 'atom',
    'Math': 'calculator',
    'Technology': 'robot',
    'Solar System': 'sun-wireless',
    'Dinosaurs': 'dinosaur',
  };
  return categoryIcons[category] || 'cube-outline';
};

// Memoized components
const ModelCard = React.memo(({ title, iconName, isSelected, onPress }: ModelCardProps) => {
  const scaleAnim = React.useRef(new RNAnimated.Value(1)).current;
  const [imageError, setImageError] = useState(false);

  React.useEffect(() => {
    RNAnimated.spring(scaleAnim, {
      toValue: isSelected ? 1.05 : 1,
      useNativeDriver: true,
      friction: 8,
    }).start();
  }, [isSelected]);

  const arModels = useSelector((state: RootState) => state.arModels.models);
  const modelData = useMemo(() =>
    arModels.find(m => m.name === title),
    [arModels, title]
  );

  if (!modelData) return null;

  const categoryIcon = getCategoryIcon(modelData.category);
  const gradientColors = isSelected
    ? ['#8E2DE2', '#6A1B9A']
    : ['#FFFFFF', '#F8F8F8'];

  const renderPreviewContent = () => {
    if (modelData.previewImage && !imageError) {
      return (
        <RNImage
          source={{ uri: modelData.previewImage }}
          style={styles.modelPreviewImage}
          resizeMode="contain"
          onError={() => setImageError(true)}
        />
      );
    }
    return (
      <MaterialCommunityIcons
        name={categoryIcon}
        size={50}
        color={isSelected ? '#FFFFFF' : '#6A1B9A'}
      />
    );
  };

  return (
    <RNAnimated.View
      style={[
        styles.modelCard,
        isSelected && styles.selectedModelCard,
        { transform: [{ scale: scaleAnim }] }
      ]}>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        style={styles.modelCardTouchable}>
        <LinearGradient
          colors={gradientColors}
          style={styles.modelCardGradient}>
          <View style={[
            styles.modelImageContainer,
            isSelected && styles.selectedModelImageContainer
          ]}>
            {renderPreviewContent()}
          </View>

          <View style={styles.modelCardContent}>
            <Text style={[
              styles.modelTitle,
              isSelected && styles.selectedModelTitle
            ]}>
              {modelData.name}
            </Text>
            <View style={styles.modelCategory}>
              <MaterialCommunityIcons
                name={categoryIcon}
                size={16}
                color={isSelected ? '#FFD700' : '#6A1B9A'}
              />
              <Text style={[
                styles.categoryText,
                isSelected && styles.selectedCategoryText
              ]}>
                {modelData.category}
              </Text>
            </View>

            <View style={styles.modelComplexity}>
              {[...Array(getComplexityStars(modelData.complexity))].map((_, i) => (
                <MaterialCommunityIcons
                  key={i}
                  name="star"
                  size={14}
                  color={isSelected ? '#FFD700' : '#6A1B9A'}
                  style={{ marginHorizontal: 1 }}
                />
              ))}
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </RNAnimated.View>
  );
});

// Helper function to convert complexity to number of stars
const getComplexityStars = (complexity: string): number => {
  const complexityMap: { [key: string]: number } = {
    'Beginner': 1,
    'Easy': 2,
    'Medium': 3,
    'Hard': 4,
    'Advanced': 5
  };
  return complexityMap[complexity] || 3;
};

const LoadingOverlay = React.memo(({ message }: { message: string }) => (
  <View style={styles.loadingOverlay}>
    <View style={styles.loadingContent}>
      <ActivityIndicator size="large" color="#6A1B9A" />
      <Text style={styles.loadingOverlayText}>{message}</Text>
    </View>
  </View>
));

// Update the ModelTransition component
const ModelTransition: React.FC<ModelTransitionProps> = React.memo(({ isVisible, children }) => {
  const fadeAnim = React.useRef(new RNAnimated.Value(0)).current;

  React.useEffect(() => {
    RNAnimated.timing(fadeAnim, {
      toValue: isVisible ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isVisible, fadeAnim]);

  if (!isVisible) return null;

  return (
    <RNAnimated.View style={{ opacity: fadeAnim }}>
      {children}
    </RNAnimated.View>
  );
});

// Update the ARScene component with better model positioning and scaling
const ARScene = React.memo(({ model, scale = DEFAULT_MODEL_SCALE, rotation }: { model: string; scale?: number; rotation?: [number, number, number] }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modelLoadAttempts, setModelLoadAttempts] = useState(0);
  const [isModelVisible, setIsModelVisible] = useState(true);
  const [sceneInitialized, setSceneInitialized] = useState(false);
  const [initializationAttempts, setInitializationAttempts] = useState(0);
  const MAX_LOAD_ATTEMPTS = 3;
  const MAX_INIT_ATTEMPTS = 3;
  const RETRY_DELAY = 2000;

  const arModels = useSelector((state: RootState) => state.arModels.models);
  const selectedModelData = useMemo(() =>
    arModels.find(m => m.name === model),
    [arModels, model]
  );

  const modelScale = useMemo((): [number, number, number] => {
    if (selectedModelData?.scale) {
      const { x, y, z } = selectedModelData.scale;
      return [x, y, z];
    }
    const baseScale = scale || DEFAULT_MODEL_SCALE;
    return [baseScale, baseScale, baseScale];
  }, [selectedModelData, scale]);

  const modelRotation = useMemo((): [number, number, number] => {
    if (selectedModelData?.rotation) {
      const { x, y, z } = selectedModelData.rotation;
      return [x, y, z];
    }
    return rotation || [0, 0, 0];
  }, [selectedModelData, rotation]);

  const modelType = useMemo(() => {
    if (!selectedModelData?.modelFile) return 'GLB';
    const fileExt = selectedModelData.modelFile.split('.').pop()?.toUpperCase();
    return fileExt === 'GLTF' ? 'GLTF' : 'GLB';
  }, [selectedModelData]);

  const validateModelUrl = useCallback((url: string): boolean => {
    try {
      if (!url) return false;
      if (!url.startsWith('http')) return false;
      new URL(url);
      return true;
    } catch (e) {
      console.error('Invalid model URL:', e);
      return false;
    }
  }, []);

  const modelUrl = useMemo(() => {
    if (!selectedModelData?.modelFile) {
      console.error('No model file in selected data');
      return null;
    }

    try {
      const modelFile = selectedModelData.modelFile;
      // Check if it's already a valid URL
      if (validateModelUrl(modelFile)) {
        return modelFile;
      }


      // Clean and construct the URL
      const cleanPath = modelFile
        .replace(/^\/+/, '')
        .replace(/^(uploads\/models\/)+/, '')
        .replace(/\/+/g, '/');

      const fullUrl = `${API_CONFIG.BASE_URL}/uploads/models/${cleanPath}`;

      if (!validateModelUrl(fullUrl)) {
        console.error('Invalid URL constructed:', fullUrl);
        return null;
      }

      return fullUrl;
    } catch (error) {
      console.error('Error formatting model URL:', error);
      return null;
    }
  }, [selectedModelData, validateModelUrl]);

  const onInitialized = useCallback((state: any) => {
    console.log('AR Scene initialization:', { state });

    if (state === ViroTrackingStateConstants.TRACKING_NORMAL) {
      setIsLoading(false);
      setSceneInitialized(true);
      setError(null);
      setInitializationAttempts(0);
    } else {
      setInitializationAttempts(prev => {
        const newAttempts = prev + 1;
        if (newAttempts >= MAX_INIT_ATTEMPTS) {
          setError('AR tracking unavailable. Please ensure good lighting and a clear surface.');
          setIsLoading(false);
        } else {
          setTimeout(() => {
            setSceneInitialized(false);
            setIsLoading(true);
            setError(null);
          }, RETRY_DELAY);
        }
        return newAttempts;
      });
    }
  }, []);

  const handleError = useCallback((event: any) => {
    const errorMessage = event?.nativeEvent?.error || 'Failed to load model';
    console.error('3D model load error:', errorMessage);

    setModelLoadAttempts(prev => {
      const newAttempts = prev + 1;
      if (newAttempts >= MAX_LOAD_ATTEMPTS) {
        setError(`Unable to load 3D model: ${errorMessage}`);
        setIsLoading(false);
        setIsModelVisible(false);
        Alert.alert(
          'Model Load Error',
          'Failed to load the 3D model. Please try another model or check your internet connection.',
          [{ text: 'OK' }]
        );
      } else {
        // Retry loading after a delay
        setTimeout(() => {
          console.log(`Retrying model load (attempt ${newAttempts + 1}/${MAX_LOAD_ATTEMPTS})...`);
          setIsLoading(true);
          setError(null);
          setIsModelVisible(false);
        }, RETRY_DELAY);
      }
      return newAttempts;
    });

    setModelLoaded(false);
  }, []);

  const handleLoadStart = useCallback(() => {
    if (!modelUrl) {
      setError('Model file not available');
      setIsLoading(false);
      Alert.alert(
        'Model Error',
        'The 3D model file is not available. Please try another model.',
        [{ text: 'OK' }]
      );
      return;
    }

    if (!validateModelUrl(modelUrl)) {
      setError('Invalid model URL');
      setIsLoading(false);
      Alert.alert(
        'Model Error',
        'The model URL is invalid. Please try another model.',
        [{ text: 'OK' }]
      );
      return;
    }

    console.log('Starting to load 3D model:', modelUrl);
    setIsLoading(true);
    setModelLoaded(false);
    setError(null);
    setIsModelVisible(false);
  }, [modelUrl, validateModelUrl]);

  const handleLoadEnd = useCallback(() => {
    console.log('3D model loaded successfully:', modelUrl);
    setIsLoading(false);
    setModelLoaded(true);
    setError(null);
    setModelLoadAttempts(0);
    // Delay showing the model slightly to ensure smooth transition
    setTimeout(() => setIsModelVisible(true), 100);
  }, [modelUrl]);

  // Add a useEffect to validate the model URL
  useEffect(() => {
    if (modelUrl) {
      setIsLoading(true);
      setModelLoaded(false);
      setError(null);

      // Validate the URL (you could add more validation here)
      if (!modelUrl.startsWith('http')) {
        setError('Invalid model URL format');
        setIsLoading(false);
        return;
      }

      // Optional: You could add a fetch request here to check if the URL is accessible
      fetch(modelUrl, { method: 'HEAD' })
        .then(response => {
          if (!response.ok) {
            throw new Error(`Model URL returned status ${response.status}`);
          }
          // URL is valid and accessible, continue loading in Viro3DObject
        })
        .catch(err => {
          setError(`Could not access model: ${err.message}`);
          setIsLoading(false);
        });
    }
  }, [modelUrl]);

  // Show error or loading state if model URL is not available
  if (!modelUrl || !validateModelUrl(modelUrl)) {
    return (
      <ViroARScene onTrackingUpdated={onInitialized}>
        <ViroNode position={[0, 0, -2]}>
          <ViroText
            text={error || "Model not available"}
            scale={[0.5, 0.5, 0.5]}
            style={{
              fontFamily: 'Arial',
              fontSize: 24,
              color: '#FF0000',
              textAlignVertical: 'center',
              textAlign: 'center',
            }}
          />
        </ViroNode>
      </ViroARScene>
    );
  }

  useEffect(() => {
    console.log("Model rendering state:", {
      modelUrl,
      modelType,
      isModelVisible,
      modelLoaded,
      isLoading,
      error,
      sceneInitialized
    });
  }, [modelUrl, modelType, isModelVisible, modelLoaded, isLoading, error, sceneInitialized]);
  return (
    <ViroARScene onTrackingUpdated={onInitialized}>
      <ViroAmbientLight color="#FFFFFF" intensity={200} />
      <ViroSpotLight
        innerAngle={5}
        outerAngle={45}
        direction={[0, -1, -.2]}
        position={[0, 3, 1]}
        color="#FFFFFF"
        intensity={250}
        castsShadow={true}
      />

      {sceneInitialized && !error && (
        <ViroNode position={[0, 0, -2]}>
          {isLoading && (
            <ViroText
              text="Loading 3D model..."
              width={2}
              height={2}
              position={[0, 0, 0]}
              style={{
                fontFamily: 'Arial',
                fontSize: 20,
                color: '#FFFFFF',
                textAlignVertical: 'center',
                textAlign: 'center'
              }}
            />
          )}



          {modelUrl && (
            <Viro3DObject
              source={{ uri: modelUrl }}
              type={modelType}
              scale={modelScale}
              position={[0, 0, 0]} // Make sure position is explicitly set
              rotation={modelRotation}
              highAccuracyEvents={true} // Add this for better event handling
              onLoadStart={() => {
                console.log("STARTING TO LOAD MODEL:", modelUrl);
                setIsLoading(true);
                setModelLoaded(false);
                setError(null);
              }}
              onLoadEnd={() => {
                console.log("MODEL LOADED SUCCESSFULLY:", modelUrl);
                setIsLoading(false);
                setModelLoaded(true);
                setError(null);
                setIsModelVisible(true);
              }}
              onError={(event) => {
                const errorMsg = event?.nativeEvent?.error || "Unknown error";
                console.error("MODEL LOAD ERROR:", errorMsg, "URL:", modelUrl);
                setError(`Failed to load: ${event.nativeEvent.error}`);
                setIsLoading(false);
              }}
              lightReceivingBitMask={2}
              shadowCastingBitMask={1}
              transformBehaviors={['billboardY']}
            />
          )}

          {error && (
            <ViroText
              text={`Error: ${error}\nPlease try again.`}
              width={2}
              height={2}
              position={[0, 0, 0]}
              style={{
                fontFamily: 'Arial',
                fontSize: 18,
                color: '#FF0000',
                textAlignVertical: 'center',
                textAlign: 'center'
              }}
            />
          )}
        </ViroNode>
      )}



      {(isLoading || error) && (
        <ViroNode position={[0, 0, -2]}>
          <ViroText
            text={error || "Initializing AR..."}
            scale={[0.5, 0.5, 0.5]}
            style={{
              fontFamily: 'Arial',
              fontSize: 24,
              color: error ? '#FF0000' : '#FFFFFF',
              textAlignVertical: 'center',
              textAlign: 'center',
            }}
          />
        </ViroNode>
      )}
    </ViroARScene>
  );
});

const InfoModal = React.memo(({ isVisible, model, onClose }: { isVisible: boolean; model: string; onClose: () => void }) => {
  const arModels = useSelector((state: RootState) => state.arModels.models);
  const selectedModel = useMemo(() =>
    arModels.find(m => m.name === model),
    [arModels, model]
  );

  if (!selectedModel) return null;

  return (
    <Modal visible={isVisible} transparent animationType="slide">
      <View style={styles.modalContainer}>
        <LinearGradient
          colors={['#FFFFFF', '#F8F8F8']}
          style={styles.modalContent}>
          <MaterialCommunityIcons
            name="cube-outline"
            size={48}
            color="#6A1B9A"
            style={styles.modalIcon}
          />
          <Text style={styles.modalTitle}>{selectedModel.name}</Text>
          <Text style={styles.modalDescription}>{selectedModel.description}</Text>
          <LinearGradient
            colors={['#8E2DE2', '#6A1B9A']}
            style={styles.modalDivider}
          />
          <Text style={styles.modalSubtitle}>Details:</Text>
          <ScrollView style={styles.partsList}>
            <View style={styles.partItem}>
              <MaterialCommunityIcons name="circle-medium" size={24} color="#6A1B9A" />
              <View style={styles.partContent}>
                <Text style={styles.partName}>Category</Text>
                <Text style={styles.partDescription}>{selectedModel.name}</Text>
              </View>
            </View>
            <View style={styles.partItem}>
              <MaterialCommunityIcons name="circle-medium" size={24} color="#6A1B9A" />
              <View style={styles.partContent}>
                <Text style={styles.partName}>Complexity</Text>
                <Text style={styles.partDescription}>{selectedModel.description}</Text>
              </View>
            </View>
            <View style={styles.partItem}>
              <MaterialCommunityIcons name="circle-medium" size={24} color="#6A1B9A" />
              <View style={styles.partContent}>
                <Text style={styles.partName}>Module</Text>
                <Text style={styles.partDescription}>{selectedModel.module.title}</Text>
              </View>
            </View>
          </ScrollView>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <LinearGradient
              colors={['#8E2DE2', '#6A1B9A']}
              style={styles.closeButtonGradient}>
              <Text style={styles.closeButtonText}>Close</Text>
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </Modal>
  );
});

const ARLearnScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const [selectedModel, setLocalSelectedModel] = useState<string | null>(null);
  const { models = [], status, error } = useSelector((state: RootState) => state.arModels);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [modelError, setModelError] = useState<string | null>(null);
  const [isARSceneVisible, setIsARSceneVisible] = useState(false);
  const [isModelChanging, setIsModelChanging] = useState(false);
  const [isARSceneLoading, setIsARSceneLoading] = useState(true);
  const fadeAnim = useRef(new RNAnimated.Value(1)).current;
  const modelChangeTimeoutRef = useRef<NodeJS.Timeout>();
  const isLoading = status === 'loading';

  // Cleanup function for model change timeout
  useEffect(() => {
    return () => {
      if (modelChangeTimeoutRef.current) {
        clearTimeout(modelChangeTimeoutRef.current);
      }
    };
  }, []);

  // Fetch models on mount with error handling
  useEffect(() => {
    const fetchModels = async () => {
      try {
        setModelError(null);
        await dispatch(fetchARModels()).unwrap();

      } catch (error: any) {
        console.error('Error fetching AR models:', error);
        setModelError(error.message || 'Failed to load models. Please try again.');
      }
    };
    fetchModels();
  }, [dispatch]);

  const handleModelSelect = useCallback(async (modelName: string) => {
    try {
      // Prevent selection during transitions
      if (isModelChanging || isModelLoading) return;

      const modelData = models.find(m => m.name === modelName);
      if (!modelData) {
        setModelError('Model data not found');
        return;
      }

      // Start transition
      setIsModelChanging(true);
      setModelError(null);

      // Fade out current model
      RNAnimated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(async () => {
        try {
          setIsARSceneVisible(false);
          setLocalSelectedModel(modelName);

          // Use the regular action instead of thunk
          dispatch(setSelectedModel(modelName));

          // Clear any existing timeout
          if (modelChangeTimeoutRef.current) {
            clearTimeout(modelChangeTimeoutRef.current);
          }

          // Set a new timeout for the fade-in animation
          modelChangeTimeoutRef.current = setTimeout(() => {
            setIsARSceneVisible(true);
            RNAnimated.timing(fadeAnim, {
              toValue: 1,
              duration: 200,
              useNativeDriver: true,
            }).start(() => {
              setIsModelChanging(false);
            });
          }, 500); // Wait for 500ms before showing new model

        } catch (error: any) {
          console.error('Error setting selected model:', error);
          setModelError(error.message || 'Failed to select model');
          setLocalSelectedModel(null);
          setIsModelChanging(false);
        }
      });
    } catch (error: any) {
      console.error('Error in handleModelSelect:', error);
      setModelError('An unexpected error occurred');
      setIsModelChanging(false);
    }

  }, [dispatch, models, isModelChanging, isModelLoading, fadeAnim]);

  // Initialize with first valid model
  useEffect(() => {
    if (models.length > 0 && !selectedModel && !isModelLoading) {
      const validModel = models.find(model => {

        return model && model.modelFile && typeof model.name === 'string';
      });
      if (validModel) {
        handleModelSelect(validModel.name);
      }
    }
  }, [models, selectedModel, handleModelSelect, isModelLoading]);

  // Handle AR scene loading state
  useEffect(() => {
    if (selectedModel && isARSceneVisible) {
      setIsARSceneLoading(true);
      const timer = setTimeout(() => {
        setIsARSceneLoading(false);
      }, 1500);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [selectedModel, isARSceneVisible]);

  // Update the renderModelSelectionPanel to show model errors
  const renderModelSelectionPanel = useMemo(() => (
    <View style={styles.modelSelectionPanel}>
      <LinearGradient
        colors={['#8E2DE2', '#6A1B9A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.modelSelectionHeader}>
        <Text style={styles.modelSelectionTitle}>3D Models</Text>
      </LinearGradient>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6A1B9A" />
          <Text style={styles.loadingText}>Loading 3D Models...</Text>
        </View>
      ) : error || modelError ? (
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons name="alert-circle" size={40} color="#FF6B6B" />
          <Text style={styles.errorText}>{modelError || error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              setModelError(null);
              setIsModelLoading(true);
              handleModelSelect(selectedModel || '');
            }}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : Array.isArray(models) && models.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.modelCardsContainer}
          decelerationRate="fast"
          snapToInterval={MODEL_CARD_WIDTH + 12}
          snapToAlignment="center">
          {models.map((model) => (
            <ModelCard
              key={model._id}
              title={model.name}
              iconName={getCategoryIcon(model.category)}
              isSelected={selectedModel === model.name}
              onPress={() => handleModelSelect(model.name)}
            />
          ))}
        </ScrollView>
      ) : (
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons name="cube-outline" size={40} color="#6A1B9A" />
          <Text style={styles.errorText}>No models available</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              setModelError(null);
              setIsModelLoading(true);
              handleModelSelect(selectedModel || '');
            }}>
            <Text style={styles.retryButtonText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  ), [selectedModel, isLoading, error, modelError, models, handleModelSelect]);

  return (
    <ErrorBoundary>
      <SafeAreaView style={styles.container}>
        <View style={styles.arContainer}>
          {selectedModel && isARSceneVisible ? (
            <RNAnimated.View style={[styles.modelContainer, { opacity: fadeAnim }]}>
              <ViroARSceneNavigator
                key={selectedModel}
                autofocus={true}
                initialScene={{
                  scene: () => (
                    <ARScene
                      model={selectedModel}
                      scale={DEFAULT_MODEL_SCALE}
                      rotation={[0, 0, 0]}
                    />
                  ),
                }}
                style={styles.arView}
              />
              {isARSceneLoading && (
                <LoadingOverlay message="Loading AR Experience..." />
              )}
            </RNAnimated.View>
          ) : (
            <View style={styles.placeholderContainer}>
              <MaterialCommunityIcons name="cube-scan" size={64} color="#6A1B9A" />
              <Text style={styles.placeholderText}>
                {modelError || "Select a model to start AR experience"}
              </Text>
            </View>
          )}
        </View>
        {renderModelSelectionPanel}
      </SafeAreaView>
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  arContainer: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#000',
    height: SCREEN_HEIGHT - MODEL_PANEL_HEIGHT,
  },
  arView: {
    flex: 1,
    height: SCREEN_HEIGHT - MODEL_PANEL_HEIGHT,
  },
  floatingHeader: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 12,
  },
  modelName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoButton: {
    padding: 4,
  },
  floatingControls: {
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: [{ translateY: -50 }],
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 8,
  },
  controlButton: {
    padding: 8,
    marginVertical: 4,
  },
  modelSelectionPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: MODEL_PANEL_HEIGHT,
    paddingBottom: Platform.OS === 'ios' ? 20 : 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modelSelectionHeader: {
    padding: 16,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  modelSelectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  modelCardsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 20,
  },
  loadingContainer: {
    padding: 24,
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxHeight: '80%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalIcon: {
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6A1B9A',
    textAlign: 'center',
    marginBottom: 12,
  },
  modalDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 24,
  },
  modalDivider: {
    height: 2,
    width: '100%',
    marginVertical: 16,
    borderRadius: 1,
  },
  modalSubtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  partsList: {
    maxHeight: 300,
  },
  partItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    backgroundColor: '#F8F8F8',
    padding: 12,
    borderRadius: 12,
  },
  partContent: {
    flex: 1,
    marginLeft: 8,
  },
  partName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6A1B9A',
    marginBottom: 4,
  },
  partDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  closeButton: {
    marginTop: 24,
    overflow: 'hidden',
    borderRadius: 12,
  },
  closeButtonGradient: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  helpText: {
    fontFamily: 'Arial',
    fontSize: 28,
    color: '#FFFFFF',
    textAlignVertical: 'center',
    textAlign: 'center',
  },
  modelCard: {
    width: MODEL_CARD_WIDTH,
    height: MODEL_CARD_HEIGHT,
    marginRight: 16,
    borderRadius: 16,
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    overflow: 'hidden',
  },
  selectedModelCard: {
    shadowColor: '#6A1B9A',
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  modelCardTouchable: {
    flex: 1,
  },
  modelCardGradient: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modelImageContainer: {
    width: MODEL_PREVIEW_SIZE,
    height: MODEL_PREVIEW_SIZE,
    backgroundColor: 'rgba(106, 27, 154, 0.1)',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  selectedModelImageContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  modelPreviewImage: {
    width: MODEL_PREVIEW_SIZE - 10,
    height: MODEL_PREVIEW_SIZE - 10,
    borderRadius: 10,
  },
  modelCardContent: {
    flex: 1,
    alignItems: 'center',
  },
  modelTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
    marginBottom: 8,
    paddingHorizontal: 8,
    lineHeight: 22,
  },
  selectedModelTitle: {
    color: '#FFFFFF',
  },
  modelCategory: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 16,
    color: '#666',
    marginLeft: 6,
  },
  selectedCategoryText: {
    color: '#FFFFFF',
  },
  modelComplexity: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  placeholderText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  modelContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    maxWidth: '80%',
  },
  loadingOverlayText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6A1B9A',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  progressBar: {
    marginTop: 10,
  },
  errorContainer: {
    position: 'absolute',
    top: '40%',
    left: 20,
    right: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    zIndex: 1000,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#F44336',
  },
  errorMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#333333',
  },
  retryButton: {
    backgroundColor: '#6A1B9A',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  trackingText: {
    fontFamily: 'Arial',
    fontSize: 18,
    color: '#FFFFFF',
    textAlignVertical: 'center',
    textAlign: 'center',
  },
  loadingText: {
    fontFamily: 'Arial',
    fontSize: 18,
    color: '#FFFFFF',
    textAlignVertical: 'center',
    textAlign: 'center',
  },
  errorText: {
    fontFamily: 'Arial',
    fontSize: 18,
    color: '#FF0000',
    textAlignVertical: 'center',
    textAlign: 'center',
  }
});

ViroAnimations.registerAnimations({
  rotate: {
    properties: {
      rotateY: "+=90"
    },
    duration: 1000,
  },
});

export default React.memo(ARLearnScreen); 