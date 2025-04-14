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
  ViroTrackingReason,
  Viro3DObject,
  ViroAmbientLight,
  ViroSpotLight,
  ViroAnimations,
} from '@reactvision/react-viro';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import ErrorBoundary from '../components/ErrorBoundary';
import LinearGradient from 'react-native-linear-gradient';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { fetchARModels, setSelectedModel } from '../store/slices/arModelsSlice';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { API_CONFIG } from '../config/api';
import axios from 'axios';
import { AnyAction } from '@reduxjs/toolkit';

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
}

// Update screen dimensions and add constants for layout
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const MODEL_PANEL_HEIGHT = SCREEN_HEIGHT * 0.25;
const MODEL_CARD_WIDTH = 130;
const MODEL_CARD_HEIGHT = 170;
const MODEL_PREVIEW_SIZE = 80;
const DEFAULT_MODEL_SCALE = 0.7;

// Add this after the screen dimensions
const PRELOAD_ADJACENT_MODELS = 2; // Number of models to preload on each side

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

const LoadingView = React.memo(() => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#6A1B9A" />
    <Text style={styles.loadingText}>Loading AR Experience...</Text>
  </View>
));

// Update the ModelTransition component
const ModelTransition: React.FC<ModelTransitionProps> = React.memo(({ isVisible, model, style }) => {
  const fadeAnim = React.useRef(new RNAnimated.Value(0)).current;

  React.useEffect(() => {
    RNAnimated.timing(fadeAnim, {
      toValue: isVisible ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isVisible, fadeAnim]);

  return (
    <RNAnimated.View style={[style, { opacity: fadeAnim }]}>
      {model}
    </RNAnimated.View>
  );
});

// Update the ARScene component with better model positioning and scaling
const ARScene = React.memo(({ model, scale = DEFAULT_MODEL_SCALE, rotation }: { model: string; scale?: number; rotation: [number, number, number] }) => {
  const dispatch = useAppDispatch();
  const [trackingState, setTrackingState] = useState<ViroTrackingStateConstants>(
    ViroTrackingStateConstants.TRACKING_UNAVAILABLE
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modelLoaded, setModelLoaded] = useState(false);
  const arModels = useSelector((state: RootState) => state.arModels.models);
  
  // Default position for the 3D model
  const defaultPosition: [number, number, number] = [0, 0, -2];
  
  const selectedModelData = useMemo(() => 
    arModels.find(m => m.name === model),
    [arModels, model]
  );

  const modelScale = useMemo((): [number, number, number] => {
    const baseScale = scale || DEFAULT_MODEL_SCALE;
    return [baseScale, baseScale, baseScale];
  }, [scale]);

  const modelType = useMemo(() => {
    const fileExt = selectedModelData?.modelFile?.split('.').pop()?.toUpperCase() || 'GLB';
    return fileExt === 'GLTF' ? 'GLTF' : 'GLB';
  }, [selectedModelData]);

  // Improved URL formatting utility
  const formatModelUrl = useCallback((modelFile: string) => {
    if (!modelFile) {
      console.error('No model file provided');
      return null;
    }

    try {
      // If it's already a full URL, return it
      if (modelFile.startsWith('http')) {
        return modelFile;
      }

      // Clean up the model path
      const cleanPath = modelFile
        .replace(/^\/+/, '')
        .replace(/^(uploads\/models\/)+/, '')
        .replace(/\/+/g, '/');

      // Use the server URL
      const finalUrl = `http://192.168.8.192:5000/uploads/models/${cleanPath}`;
      console.log('Loading 3D model from:', finalUrl);
      return finalUrl;
    } catch (error) {
      console.error('Error formatting model URL:', error);
      return null;
    }
  }, []);

  const modelUrl = useMemo(() => {
    if (!selectedModelData?.modelFile) {
      console.error('No model file in selected data');
      return null;
    }
    const url = formatModelUrl(selectedModelData.modelFile);
    console.log('Final model URL:', url);
    return url;
  }, [selectedModelData, formatModelUrl]);

  // Reset loading state when model changes
  useEffect(() => {
    console.log('Model changed to:', model);
    setIsLoading(true);
    setModelLoaded(false);
    setError(null);
  }, [model]);

  const onInitialized = useCallback((state: ViroTrackingStateConstants, reason: ViroTrackingReason) => {
    console.log('AR Tracking State:', state, 'Reason:', reason);
    setTrackingState(state);
    if (state === ViroTrackingStateConstants.TRACKING_NORMAL) {
      setIsLoading(false);
    }
  }, []);

  // Loading state component with progress indicator
  const LoadingState = () => (
    <ViroNode position={defaultPosition} scale={[1, 1, 1]}>
      <ViroText
        text={`Loading ${selectedModelData?.name || '3D Model'}...`}
        scale={[0.5, 0.5, 0.5]}
        position={[0, 0.5, 0]}
        style={{
          fontFamily: 'Arial',
          fontSize: 24,
          color: '#FFFFFF',
          textAlignVertical: 'center',
          textAlign: 'center',
        }}
        width={2}
        height={0.5}
      />
    </ViroNode>
  );

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
      
      {!error && modelUrl && (
        <ViroNode 
          position={defaultPosition}
          dragType="FixedToWorld"
          onDrag={() => {}}
          visible={true}>
          <Viro3DObject
            source={{ 
              uri: modelUrl,
              headers: {
                'Accept': '*/*',
                'Content-Type': 'application/octet-stream',
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
              }
            }}
            resources={[]}
            scale={modelScale}
            position={[0, 0, 0]}
            rotation={rotation}
            type={modelType}
            animation={{name: "rotate", run: true, loop: true}}
            onLoadStart={() => {
              console.log('Starting to load 3D model:', modelUrl);
              setIsLoading(true);
              setModelLoaded(false);
              setError(null);
            }}
            onLoadEnd={() => {
              console.log('3D model loaded successfully:', modelUrl);
              setIsLoading(false);
              setModelLoaded(true);
            }}
            onError={(event: any) => {
              const errorMessage = event?.nativeEvent?.error || 'Unknown error';
              console.error('3D model load error:', errorMessage, 'URL:', modelUrl);
              setError(`Failed to load model: ${errorMessage}`);
              setIsLoading(false);
              setModelLoaded(false);
            }}
          />
        </ViroNode>
      )}

      {isLoading && <LoadingState />}
      {error && (
        <ViroNode position={[0, 0, -2]}>
          <ViroText
            text={error}
            scale={[0.4, 0.4, 0.4]}
            position={[0, 0, 0]}
            style={{
              fontFamily: 'Arial',
              fontSize: 20,
              color: '#FF0000',
              textAlignVertical: 'center',
              textAlign: 'center',
            }}
            width={2}
            height={0.5}
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
  const isLoading = status === 'loading';
  const fadeAnim = useRef(new RNAnimated.Value(1)).current;

  // Load models when component mounts
  useEffect(() => {
    dispatch(fetchARModels());
  }, [dispatch]);

  // Enhanced model selection handler with animation
  const handleModelSelect = useCallback((modelName: string) => {
    console.log('Selecting model:', modelName);
    if (modelName === selectedModel) return;

    // Find the selected model data
    const modelData = models.find(m => m.name === modelName);
    if (!modelData) {
      console.error('Selected model not found:', modelName);
      return;
    }

    console.log('Selected model data:', modelData);

    // Fade out current model
    RNAnimated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      setLocalSelectedModel(modelName);
      dispatch(setSelectedModel(modelName));
      
      // Fade in new model
      RNAnimated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start();
    });
  }, [dispatch, selectedModel, fadeAnim, models]);

  // Initialize first model when models are loaded
  useEffect(() => {
    if (models.length > 0 && !selectedModel) {
      const firstModel = models[0];
      console.log('Initializing with first model:', firstModel.name);
      handleModelSelect(firstModel.name);
    }
  }, [models, selectedModel, handleModelSelect]);

  const handleRetry = useCallback(() => {
    dispatch(fetchARModels());
  }, [dispatch]);

  const renderModelSelectionPanel = () => (
    <View style={[styles.modelSelectionPanel, selectedModel && styles.collapsedPanel]}>
      <LinearGradient
        colors={['#8E2DE2', '#6A1B9A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.modelSelectionHeader}>
        <Text style={styles.modelSelectionTitle}>
          {selectedModel ? 'Current Model' : 'Choose Your 3D Model'}
        </Text>
        {!selectedModel && (
          <Text style={styles.modelSelectionSubtitle}>Explore and learn in AR!</Text>
        )}
      </LinearGradient>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6A1B9A" />
          <Text style={styles.loadingText}>Loading 3D Models...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons name="alert-circle" size={40} color="#FF6B6B" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={handleRetry}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : Array.isArray(models) && models.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[
            styles.modelCardsContainer,
            selectedModel && styles.collapsedModelCards
          ]}
          decelerationRate="fast"
          snapToInterval={MODEL_CARD_WIDTH + 12}
          snapToAlignment="center"
          pagingEnabled>
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
            onPress={handleRetry}>
            <Text style={styles.retryButtonText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <ErrorBoundary>
      <SafeAreaView style={styles.container}>
        <View style={styles.arContainer}>
          {selectedModel ? (
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
          ) : (
            <View style={styles.placeholderContainer}>
              <MaterialCommunityIcons name="cube-scan" size={64} color="#6A1B9A" />
              <Text style={styles.placeholderText}>Select a model to start AR experience</Text>
            </View>
          )}
        </View>
        {renderModelSelectionPanel()}
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
  modelSelectionSubtitle: {
    fontSize: 14,
    color: '#E0E0E0',
  },
  modelCardsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 12,
    flexGrow: 1,
  },
  loadingContainer: {
    padding: 24,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  errorContainer: {
    padding: 24,
    alignItems: 'center',
  },
  errorText: {
    marginTop: 12,
    fontSize: 14,
    color: '#FF6B6B',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#6A1B9A',
    borderRadius: 20,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
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
    marginRight: 12,
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
    padding: 12,
    alignItems: 'center',
  },
  modelImageContainer: {
    width: MODEL_PREVIEW_SIZE,
    height: MODEL_PREVIEW_SIZE,
    backgroundColor: 'rgba(106, 27, 154, 0.1)',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
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
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
    marginBottom: 4,
    paddingHorizontal: 4,
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
    fontSize: 12,
    color: '#666',
  },
  selectedCategoryText: {
    color: '#FFFFFF',
  },
  modelComplexity: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  collapsedPanel: {
    height: MODEL_PANEL_HEIGHT * 0.6,
  },
  collapsedModelCards: {
    paddingVertical: 4,
    gap: 8,
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
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