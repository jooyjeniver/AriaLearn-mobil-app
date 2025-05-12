import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ScrollView,
  Modal,
  Dimensions,
  Platform,
  ActivityIndicator,
  Alert,
  BackHandler,
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
  ViroARTrackingTargets,
  ViroARPlaneSelector,
  ViroSphere,
  ViroMaterials,
} from '@reactvision/react-viro';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import ErrorBoundary from '../components/ErrorBoundary';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { selectModel, setModels, fetchARModels, ARModel } from '../store/slices/arModelsSlice';
import { useAppDispatch } from '../store/hooks';
import { API_CONFIG } from '../config/api';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

// Use direct URLs instead of local assets that don't exist
const DEBUG = {
  ENABLED: true,
  // Use CDN models instead of local assets
  FALLBACK_URL: 'https://storage.googleapis.com/actlab-public/models/Box.glb',
  FALLBACK_URLS: {
    OBJ: 'https://storage.googleapis.com/actlab-public/models/Box.obj',
    GLB: 'https://storage.googleapis.com/actlab-public/models/Box.glb',
    GLTF: 'https://storage.googleapis.com/actlab-public/models/Box.gltf',
    FBX: 'https://storage.googleapis.com/actlab-public/models/Box.glb',
  }
};

// Fix ModelInfo interface conflict
interface CategoryInfo {
  title: string;
  iconName: string;
  description: string;
  parts?: { name: string; description: string }[];
}

// AR Model info for 3D objects
interface ModelInfo {
  source: { uri: string };
  type: "OBJ" | "GLB" | "VRX" | "GLTF";
  scale: [number, number, number];
  name?: string;
  modelFile?: string;
  fileType?: string;
}

// Replace pre-require statements with direct URL mappings for models
const localModels = {
  'Human Heart': 'https://storage.googleapis.com/actlab-public/models/heart.obj',
  'Solar System': 'https://storage.googleapis.com/actlab-public/models/solar_system.obj',
  'Dinosaur': 'https://storage.googleapis.com/actlab-public/models/dinosaur.obj',
};

// Memoized model data - keep for fallback
const localModelData = {
  'Human Heart': {
    title: 'Human Heart',
    iconName: 'heart-pulse',
    description: 'The human heart is a muscular organ that pumps blood throughout the body.',
    parts: [
      { name: 'Left Ventricle', description: 'Pumps oxygenated blood to the body' },
      { name: 'Right Ventricle', description: 'Pumps blood to the lungs' },
      { name: 'Left Atrium', description: 'Receives oxygenated blood from lungs' },
      { name: 'Right Atrium', description: 'Receives deoxygenated blood from body' },
    ],
  },
  'Solar System': {
    title: 'Solar System',
    iconName: 'solar-system',
    description: 'Our solar system consists of the Sun and celestial objects bound to it by gravity.',
    parts: [
      { name: 'Sun', description: 'The star at the center of our solar system' },
      { name: 'Earth', description: 'The third planet from the Sun' },
      { name: 'Mars', description: 'The fourth planet from the Sun' },
      { name: 'Jupiter', description: 'The largest planet in our solar system' },
    ],
  },
  'Dinosaur': {
    title: 'Dinosaur',
    iconName: 'dinosaur',
    description: 'Dinosaurs were the dominant terrestrial vertebrates for over 160 million years.',
    parts: [
      { name: 'Skull', description: 'The bony structure of the head' },
      { name: 'Vertebrae', description: 'The bones that make up the spine' },
      { name: 'Ribs', description: 'Bones that protect internal organs' },
      { name: 'Limbs', description: 'Used for movement and support' },
    ],
  },
} as const;

interface ModelCardProps {
  model: ARModel;
  isSelected: boolean;
  onPress: () => void;
}

// Helper function to get an appropriate icon for the model
const getModelIcon = (model: ARModel): string => {
  // Try to match model name with common subjects
  const modelName = model.name.toLowerCase();
  if (modelName.includes('heart') || modelName.includes('organ')) {
    return 'heart-pulse';
  } else if (modelName.includes('solar') || modelName.includes('planet')) {
    return 'solar-system';
  } else if (modelName.includes('dinosaur') || modelName.includes('fossil')) {
    return 'dinosaur';
  } else if (modelName.includes('atom') || modelName.includes('molecule')) {
    return 'atom';
  } else if (modelName.includes('brain') || modelName.includes('neuro')) {
    return 'brain';
  } else if (modelName.includes('cell') || modelName.includes('bio')) {
    return 'microscope';
  } else {
    // Default icon
    return 'cube-scan';
  }
};

// Optimized model card with memoization
const ModelCard = React.memo(({ model, isSelected, onPress }: ModelCardProps) => {
  const iconName = useMemo(() => getModelIcon(model), [model]);
  
  return (
    <TouchableOpacity
      style={[styles.modelCard, isSelected && styles.selectedModelCard]}
      onPress={onPress}>
      <MaterialCommunityIcons 
        name={iconName} 
        size={40} 
        color={isSelected ? '#6A1B9A' : '#666666'} 
        style={styles.cardIcon} 
      />
      <Text style={[styles.modelTitle, isSelected && styles.selectedModelTitle]}>{model.name}</Text>
    </TouchableOpacity>
  );
});

const LoadingView = React.memo(() => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#6A1B9A" />
    <Text style={styles.loadingText}>Loading AR Experience...</Text>
  </View>
));

// Get file extension from URL
const getFileExtension = (url: string): string => {
  const parts = url.split('.');
  return parts[parts.length - 1].toLowerCase();
};

// Fix the type for ARSceneProps
interface ARSceneProps {
  model: ARModel;
  scale: number;
  rotation: [number, number, number];
  onError?: (error: any) => void;
  onTrackingUpdated?: (state: ViroTrackingStateConstants, reason?: ViroTrackingReason) => void;
}

// Optimized AR Scene component - simplified to fix all linter errors
const ARScene: React.FC<ARSceneProps> = ({ model, scale, rotation, onError, onTrackingUpdated }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [modelLoadAttempts, setModelLoadAttempts] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [modelPosition, setModelPosition] = useState<[number, number, number]>([0, -0.1, -0.5]);
  const [modelScale, setModelScale] = useState<[number, number, number]>([0.2, 0.2, 0.2]);
  const [modelRotation, setModelRotation] = useState<[number, number, number]>([0, 0, 0]);
  const [showDescription, setShowDescription] = useState(true);
  const [trackingState, setTrackingState] = useState<ViroTrackingStateConstants>(
    ViroTrackingStateConstants.TRACKING_UNAVAILABLE
  );
  const [debugInfo, setDebugInfo] = useState<string>('');
  const isMounted = useRef(true);
  
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Handle tracking updates and forward to parent
  const handleTrackingUpdated = useCallback((state: ViroTrackingStateConstants, reason: ViroTrackingReason) => {
    setTrackingState(state);
    
    if (state === ViroTrackingStateConstants.TRACKING_NORMAL) {
      setIsLoading(false);
    } else if (state === ViroTrackingStateConstants.TRACKING_UNAVAILABLE) {
      setIsLoading(true);
    }
    
    if (onTrackingUpdated) {
      onTrackingUpdated(state, reason);
    }
  }, [onTrackingUpdated]);

  // Create modelInfo
  const modelInfo = useMemo(() => {
    try {
      if (model && model.modelFile) {
        // Check if it's an API path
        const isApiPath = model.modelFile.startsWith('/uploads');
        
        let sourceUrl;
        if (isApiPath) {
          sourceUrl = `${API_CONFIG.BASE_URL}${model.modelFile}`;
        } else if (model.modelFile.startsWith('http')) {
          sourceUrl = model.modelFile;
        } else {
          sourceUrl = "https://storage.googleapis.com/actlab-public/models/Box.glb";
        }

        // Determine file type and scale
        let viroType: "OBJ" | "GLB" | "VRX" | "GLTF" = "GLB";
        const fileType = model.fileType?.toLowerCase() || 'glb';
        
        if (fileType === 'obj') viroType = 'OBJ';
        else if (fileType === 'glb') viroType = 'GLB';
        else if (fileType === 'gltf') viroType = 'GLTF';
        else if (fileType === 'vrx') viroType = 'VRX';
        
        let scale: [number, number, number] = [0.2, 0.2, 0.2];
        if (model.scale) {
          if (typeof model.scale === 'object' && 'x' in model.scale) {
            scale = [model.scale.x, model.scale.y, model.scale.z];
          }
        }
        
        return {
          source: { uri: sourceUrl },
          type: viroType,
          scale: scale
        };
      }
      
      // Fallback
      return {
        source: { uri: "https://storage.googleapis.com/actlab-public/models/Box.glb" },
        type: 'GLB' as const,
        scale: [0.15, 0.15, 0.15] as [number, number, number]
      };
    } catch (error) {
      console.error('Error creating modelInfo:', error);
      
      return {
        source: { uri: "https://storage.googleapis.com/actlab-public/models/Box.glb" },
        type: 'GLB' as const,
        scale: [0.15, 0.15, 0.15] as [number, number, number]
      };
    }
  }, [model]);

  // Track state
  const trackingStateText = useMemo(() => {
    switch (trackingState) {
      case ViroTrackingStateConstants.TRACKING_NORMAL:
        return 'Tracking Normal';
      case ViroTrackingStateConstants.TRACKING_LIMITED:
        return 'Tracking Limited';
      case ViroTrackingStateConstants.TRACKING_UNAVAILABLE:
      default:
        return 'Tracking Unavailable';
    }
  }, [trackingState]);

  // Update debug info
  useEffect(() => {
    if (!isMounted.current) return;
    
    let statusText = '';
    
    if (errorMessage) {
      statusText = `Error: ${errorMessage}`;
    } else if (isLoading) {
      statusText = 'Loading 3D Model...';
    } else {
      statusText = `AR Tracking: ${trackingStateText}`;
    }
    
    setDebugInfo(statusText);
  }, [isLoading, trackingStateText, errorMessage]);

  // Handle model errors
  const handleModelError = useCallback((error: any) => {
    const errorMsg = error?.message || 'Unknown error occurred';
    console.log(`Model error: ${errorMsg}`);
    setErrorMessage(errorMsg);
    setIsLoading(false);
    
    if (onError) {
      onError({
        message: errorMsg,
        source: model?.modelFile,
        critical: modelLoadAttempts > 1,
      });
    }
    
    setModelLoadAttempts(prev => prev + 1);
  }, [model, modelLoadAttempts, onError]);

  // Movement, scale and rotation controls
  const moveModel = useCallback((direction: string, amount: number = 0.1) => {
    setModelPosition(current => {
      const [x, y, z] = current;
      switch(direction) {
        case 'left': return [x - amount, y, z] as [number, number, number];
        case 'right': return [x + amount, y, z] as [number, number, number];
        case 'up': return [x, y + amount, z] as [number, number, number];
        case 'down': return [x, y - amount, z] as [number, number, number];
        case 'forward': return [x, y, z - amount] as [number, number, number];
        case 'backward': return [x, y, z + amount] as [number, number, number];
        default: return current;
      }
    });
  }, []);

  const scaleModel = useCallback((scaleAction: string) => {
    setModelScale(current => {
      const [x, y, z] = current;
      const scaleChange = 0.05;
      switch(scaleAction) {
        case 'increase': return [x + scaleChange, y + scaleChange, z + scaleChange] as [number, number, number];
        case 'decrease': return [Math.max(0.05, x - scaleChange), Math.max(0.05, y - scaleChange), Math.max(0.05, z - scaleChange)] as [number, number, number];
        default: return current;
      }
    });
  }, []);

  const rotateModel = useCallback((axis: string, amount: number = 15) => {
    setModelRotation(current => {
      const [x, y, z] = current;
      switch(axis) {
        case 'x': return [x + amount, y, z] as [number, number, number];
        case 'y': return [x, y + amount, z] as [number, number, number];
        case 'z': return [x, y, z + amount] as [number, number, number];
        default: return current;
      }
    });
  }, []);

  const toggleDescription = useCallback(() => {
    setShowDescription(prev => !prev);
  }, []);

  const modelDescription = useMemo(() => {
    return model.description || `${model.name} - A 3D model to explore. Use the controls to rotate, move, and scale.`;
  }, [model]);

  return (
    <ViroARScene onTrackingUpdated={handleTrackingUpdated}>
      {/* Lighting */}
      <ViroAmbientLight color="#ffffff" intensity={300} />
      <ViroSpotLight
        innerAngle={5}
        outerAngle={45}
        direction={[0, -1, -0.2]}
        position={[0, 5, 1]}
        color="#ffffff"
        castsShadow={true}
      />
      
      {/* Spinner while loading */}
      {(isLoading && !modelLoaded) && (
        <ViroNode position={[0, 0, -1]} scale={[0.1, 0.1, 0.1]}>
          <ViroSphere
            radius={0.1}
            position={[0, 0, 0]}
            materials={["spinnerMaterial"]}
            animation={{
              name: "spinLoader",
              run: true,
              loop: true
            }}
          />
          <ViroText
            text="Loading model..."
            position={[0, -0.3, 0]}
            scale={[1, 1, 1]}
            width={2}
            height={2}
            style={{ fontSize: 16, color: 'white', textAlignVertical: 'center', textAlign: 'center' }}
          />
        </ViroNode>
      )}

      {/* 3D Model */}
      <ViroNode 
        position={modelPosition} 
        scale={[0.8, 0.8, 0.8] as [number, number, number]} 
        rotation={[0, 0, 0] as [number, number, number]}>
        <Viro3DObject
          source={modelInfo.source}
          type={modelInfo.type}
          scale={modelScale}
          rotation={modelRotation}
          highAccuracyEvents={true}
          animation={{ name: "rotate", run: modelLoaded, loop: true }}
          onLoadStart={() => {
            setIsLoading(true);
            setModelLoaded(false);
            setErrorMessage(null);
          }}
          onLoadEnd={() => {
            setIsLoading(false);
            setModelLoaded(true);
          }}
          onError={handleModelError}
        />
      </ViroNode>

      {/* Model description text */}
      {modelLoaded && showDescription && (
        <ViroText
          text={modelDescription}
          width={2}
          height={0.5}
          position={[0, 0.5, -1]}
          style={{ fontSize: 16, color: 'white', textAlignVertical: 'center', textAlign: 'center' }}
        />
      )}

      {/* Status text */}
      <ViroText
        text={debugInfo}
        width={2}
        height={0.5}
        position={[0, -0.7, -1]}
        scale={[0.5, 0.5, 0.5]}
        style={{ fontSize: 16, color: 'white', textAlignVertical: 'center', textAlign: 'center' }}
      />

      {/* Controls - only when model is loaded */}
      {modelLoaded && (
        <>
          {/* Row 1: Movement */}
          <ViroNode position={[-0.6, -0.5, -1.2]}>
            <ViroText
              text="Move"
              position={[0, 0.05, 0]}
              scale={[0.1, 0.1, 0.1]}
              style={{ color: 'white', textAlign: 'center' }}
            />
            <ViroText
              text="←"
              position={[-0.05, 0, 0]}
              scale={[0.1, 0.1, 0.1]}
              style={{ color: 'white', textAlign: 'center' }}
              onClick={() => moveModel('left')}
            />
            <ViroText
              text="→"
              position={[0.05, 0, 0]}
              scale={[0.1, 0.1, 0.1]}
              style={{ color: 'white', textAlign: 'center' }}
              onClick={() => moveModel('right')}
            />
            <ViroText
              text="↑"
              position={[0, 0.05, 0]}
              scale={[0.1, 0.1, 0.1]}
              style={{ color: 'white', textAlign: 'center' }}
              onClick={() => moveModel('forward')}
            />
            <ViroText
              text="↓"
              position={[0, -0.05, 0]}
              scale={[0.1, 0.1, 0.1]}
              style={{ color: 'white', textAlign: 'center' }}
              onClick={() => moveModel('backward')}
            />
          </ViroNode>
          
          {/* Row 2: Scale */}
          <ViroNode position={[0, -0.5, -1.2]}>
            <ViroText
              text="Scale"
              position={[0, 0.05, 0]}
              scale={[0.1, 0.1, 0.1]}
              style={{ color: 'white', textAlign: 'center' }}
            />
            <ViroText
              text="+"
              position={[0.05, 0, 0]}
              scale={[0.1, 0.1, 0.1]}
              style={{ color: 'white', textAlign: 'center' }}
              onClick={() => scaleModel('increase')}
            />
            <ViroText
              text="-"
              position={[-0.05, 0, 0]}
              scale={[0.1, 0.1, 0.1]}
              style={{ color: 'white', textAlign: 'center' }}
              onClick={() => scaleModel('decrease')}
            />
          </ViroNode>
          
          {/* Row 3: Rotate */}
          <ViroNode position={[0.6, -0.5, -1.2]}>
            <ViroText
              text="Rotate"
              position={[0, 0.05, 0]}
              scale={[0.1, 0.1, 0.1]}
              style={{ color: 'white', textAlign: 'center' }}
            />
            <ViroText
              text="X"
              position={[-0.05, 0, 0]}
              scale={[0.1, 0.1, 0.1]}
              style={{ color: 'white', textAlign: 'center' }}
              onClick={() => rotateModel('x')}
            />
            <ViroText
              text="Y"
              position={[0, 0, 0]}
              scale={[0.1, 0.1, 0.1]}
              style={{ color: 'white', textAlign: 'center' }}
              onClick={() => rotateModel('y')}
            />
            <ViroText
              text="Z"
              position={[0.05, 0, 0]}
              scale={[0.1, 0.1, 0.1]}
              style={{ color: 'white', textAlign: 'center' }}
              onClick={() => rotateModel('z')}
            />
          </ViroNode>
          
          {/* Toggle description */}
          <ViroNode position={[0, -0.6, -1.2]}>
            <ViroText
              text={showDescription ? "Hide Info" : "Show Info"}
              position={[0, 0, 0]}
              scale={[0.1, 0.1, 0.1]}
              style={{ color: 'white', textAlign: 'center' }}
              onClick={toggleDescription}
            />
          </ViroNode>
        </>
      )}
    </ViroARScene>
  );
};

// Enhanced InfoModal using Redux data
const InfoModal = React.memo(({ isVisible, model, onClose }: { isVisible: boolean; model: ARModel; onClose: () => void }) => {
  // Generate parts data from model description (if available)
  const parts = useMemo(() => {
    // This is just a placeholder. In a real app, you'd parse structured data from your API
    // For now, we'll just create some generic parts
    return [
      { name: 'Component 1', description: 'Primary component of the model' },
      { name: 'Component 2', description: 'Secondary component with supporting function' },
      { name: 'Component 3', description: 'Tertiary element that completes the structure' },
    ];
  }, [model]);

  return (
    <Modal visible={isVisible} transparent animationType="slide">
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{model.name}</Text>
          <Text style={styles.modalDescription}>{model.description || 'No description available.'}</Text>
          <Text style={styles.modalSubtitle}>Key Parts:</Text>
          {parts.map((part, index) => (
            <View key={index} style={styles.partItem}>
              <Text style={styles.partName}>{part.name}</Text>
              <Text style={styles.partDescription}>{part.description}</Text>
            </View>
          ))}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
});

const ARLearnScreen: React.FC = () => {
  // Access navigation
  const navigation = useNavigation();
  
  // Redux state and dispatch
  const dispatch = useAppDispatch();
  const { models, loading, error, selectedModel } = useSelector(
    (state: RootState) => state.arModels
  );
  
  // Local state
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState<[number, number, number]>([0, 0, 0]);
  const [showInfo, setShowInfo] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [arViewActive, setArViewActive] = useState(true);
  const [modelLoadAttempts, setModelLoadAttempts] = useState(0);
  // Loading state for AR scene spinner
  const [arSceneLoading, setArSceneLoading] = useState(true);
  
  // Processed model list to avoid type errors
  const processedModels = useMemo(() => {
    if (!models) return [];
    return models.map((model, index) => ({
      ...model,
      displayId: `model-${index}`, // Add a safe displayId for keys
    }));
  }, [models]);
  
  // Refs for tracking component state
  const isMounted = useRef(true);
  const navigationAttempted = useRef(false);
  
  // Check camera permission function
  const checkCameraPermission = useCallback(async () => {
    try {
      const permission = Platform.OS === 'ios'
        ? PERMISSIONS.IOS.CAMERA
        : PERMISSIONS.ANDROID.CAMERA;
        
      const result = await check(permission);
      
      if (result === RESULTS.GRANTED) {
        setHasCameraPermission(true);
      } else if (result === RESULTS.DENIED) {
        const requestResult = await request(permission);
        setHasCameraPermission(requestResult === RESULTS.GRANTED);
      } else {
        setHasCameraPermission(false);
      }
    } catch (err) {
      console.error('Error checking camera permission:', err);
      setHasCameraPermission(false);
    }
  }, []);
  
  // Immediately fetch models on mount
  useEffect(() => {
    dispatch(fetchARModels());
    checkCameraPermission();
    
    // Cleanup function
    return () => {
      isMounted.current = false;
      // Ensure we release AR resources
      setArViewActive(false);
    };
  }, [dispatch, checkCameraPermission]);

  // Handle AR Scene loading state
  const handleARSceneLoading = (isLoading: boolean) => {
    setArSceneLoading(isLoading);
  };
  
  // Handle Android back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (navigationAttempted.current) {
        return false; // Let default behavior happen if we're already navigating
      }
      
      navigationAttempted.current = true;
      handleBackPress();
      return true; // Prevent default back action
    });
    
    return () => {
      backHandler.remove();
    };
  }, []);
  
  // Function to safely navigate back
  const handleBackPress = useCallback(() => {
    setArViewActive(false);
    
    // Small delay to ensure AR resources are released
    setTimeout(() => {
      if (navigation && navigation.goBack && !navigationAttempted.current) {
        navigationAttempted.current = true;
        navigation.goBack();
      }
    }, 300);
  }, [navigation]);
  
  // Reset navigation state when screen gains focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      navigationAttempted.current = false;
      setArViewActive(true);
      // Reset loading state for AR scene
      setArSceneLoading(true);
    });
    
    return unsubscribe;
  }, [navigation]);
  
  // Current model selection (improved with null safety)
  const currentModel = useMemo(() => {
    return selectedModel || (models && models.length > 0 ? models[0] : null);
  }, [selectedModel, models]);

  // Log model details when the selected model changes
  useEffect(() => {
    if (currentModel) {
      // Log details about the model
      console.log('🏆 Selected model details:', {
        id: currentModel._id,
        name: currentModel.name,
        modelFile: currentModel.modelFile,
        fileType: currentModel.fileType
      });
      
      // Uncomment the below code to force using a specific model for testing
      /* 
      // Force use of a specific model for testing
      const reliableUrl = 'https://storage.googleapis.com/actlab-public/models/Box.glb';
      if (currentModel.modelFile !== reliableUrl) {
        const updatedModel = {
          ...currentModel,
          modelFile: reliableUrl,
          fileType: 'GLB'
        };
        dispatch(selectModel(updatedModel));
      }
      */
    } else {
      console.log('⚠️ No model selected yet');
    }
  }, [currentModel]);

  // Add a debug log for the state of models
  useEffect(() => {
    if (loading) {
      console.log('🔄 Loading AR models from API...');
    } else if (error) {
      console.error('❌ Error loading AR models:', error);
    } else if (models && models.length > 0) {
      console.log(`✓ ${models.length} AR models loaded from API`);
      
      // Log the first model details to debug
      const sampleModel = models[0];
      console.log('📋 Sample model:', {
        id: sampleModel._id,
        name: sampleModel.name,
        modelFile: sampleModel.modelFile,
        fileType: sampleModel.fileType
      });
    } else {
      console.warn('⚠️ No AR models available in state');
    }
  }, [models, loading, error]);
  
  // Update the useEffect
  useEffect(() => {
    // Add debug log for the state of models
    console.log('Current ARModels state:', models);
    
    // If no models loaded yet, add sample models and select the first one
    if (models.length === 0 && !isLoading) {
      const sampleModels = [
        {
          _id: 'sample-1',
          name: 'API Model Test',
          description: 'Testing model from API server',
          category: 'test',
          difficulty: 1,
          modelFile: '/uploads/models/treeparts.glb', // Use the API path that matches your server structure
          fileType: 'GLB',
          thumbnail: 'https://via.placeholder.com/150?text=Test',
          created: new Date().toISOString(),
          tags: ['test', 'api', 'sample'],
          scale: { x: 0.2, y: 0.2, z: 0.2 },
          rotation: { x: 0, y: 0, z: 0 }
        },
        {
          _id: 'sample-2',
          name: 'Backup Box Model',
          description: 'A simple 3D box model for testing',
          category: 'basic',
          difficulty: 1,
          modelFile: 'https://storage.googleapis.com/actlab-public/models/Box.glb',
          fileType: 'GLB',
          thumbnail: 'https://via.placeholder.com/150?text=Box',
          created: new Date().toISOString(),
          tags: ['box', 'basic', 'sample'],
          scale: { x: 0.2, y: 0.2, z: 0.2 },
          rotation: { x: 0, y: 0, z: 0 }
        }
      ];
      
      // Update the models in Redux and select the first one
      dispatch(setModels(sampleModels));
      dispatch(selectModel(sampleModels[0]));
      
      console.log('Sample models added for AR testing:', sampleModels);
    }

    // Log the first model details to debug
    if (models.length > 0) {
      const sampleModel = models[0];
      console.log('First AR Model:', {
        id: sampleModel._id,
        name: sampleModel.name,
        modelFile: sampleModel.modelFile,
        fileType: sampleModel.fileType
      });
    }
  }, [models, isLoading, dispatch]);
  
  // Render with improved navigation and error handling
  return (
    <ErrorBoundary>
      <SafeAreaView style={styles.container}>
        {/* Header with back button */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
              <MaterialCommunityIcons name="arrow-left" size={24} color="#6A1B9A" />
            </TouchableOpacity>
            <Text style={[styles.title, {flex: 1, textAlign: 'center'}]}>
              {currentModel?.name || 'AR Model'}
            </Text>
            <TouchableOpacity onPress={() => setShowInfo(true)} style={styles.infoButton}>
              <MaterialCommunityIcons name="information-outline" size={22} color="#6A1B9A" />
            </TouchableOpacity>
          </View>
        </View>

        {/* AR Container with safety check */}
        <View style={styles.cameraContainer}>
          {/* Loading spinner while AR Scene is initializing */}
          {arSceneLoading && (
            <View style={styles.arLoadingContainer}>
              <ActivityIndicator size="large" color="#FFFFFF" />
              <Text style={styles.arLoadingText}>Initializing AR Experience...</Text>
            </View>
          )}
          
          {currentModel && arViewActive && (
            <ViroARSceneNavigator
              autofocus={true}
              initialScene={{
                scene: () => (
                  <ARScene 
                    model={currentModel} 
                    scale={scale} 
                    rotation={rotation} 
                    onError={(error) => {
                      console.log('🔄 ARScene error:', error);
                      
                      // Show an alert if all fallbacks have failed
                      if (error.critical) {
                        Alert.alert(
                          'Error Loading 3D Model',
                          'We could not load any 3D models. Please check your internet connection and try again.',
                          [{ text: 'OK', onPress: () => console.log('Alert closed') }]
                        );
                      }
                      
                      // Update loading state
                      handleARSceneLoading(false);
                    }}
                    // Pass tracking update handler to ARScene
                    onTrackingUpdated={(state) => {
                      // When tracking becomes normal, we know AR is initialized
                      if (state === ViroTrackingStateConstants.TRACKING_NORMAL) {
                        handleARSceneLoading(false);
                      }
                    }}
                  />
                ),
              }}
              style={styles.arView}
            />
          )}
        </View>

        {/* Add model selection at bottom */}
        <View style={styles.modelSelection}>
          <Text style={styles.sectionTitle}>Choose a 3D Model</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.modelScrollContent}
            decelerationRate="fast"
            snapToInterval={110} // card width + margin
            snapToAlignment="center"
          >
            {!loading && processedModels.length > 0 ? (
              processedModels.map((item) => (
                <TouchableOpacity
                  key={item.displayId}
                  style={[
                    styles.enhancedModelCard,
                    currentModel?.name === item.name && styles.enhancedSelectedModelCard
                  ]}
                  onPress={() => {
                    // Set loading to true when changing models
                    setArSceneLoading(true);
                    dispatch(selectModel(item));
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.modelIconContainer}>
                    <MaterialCommunityIcons 
                      name={getModelIcon(item)} 
                      size={38} 
                      color={currentModel?.name === item.name ? '#FFFFFF' : '#6A1B9A'} 
                    />
                  </View>
                  <Text style={[
                    styles.enhancedModelTitle,
                    currentModel?.name === item.name && styles.enhancedSelectedModelTitle
                  ]}>{item.name}</Text>
                  <View style={styles.modelBadge}>
                    <Text style={styles.modelBadgeText}>
                      {item.fileType || 'OBJ'}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            ) : loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#6A1B9A" />
                <Text style={styles.loadingText}>Loading models...</Text>
              </View>
            ) : (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>No models available</Text>
              </View>
            )}
          </ScrollView>
        </View>

        {/* Info Modal */}
        {currentModel && (
          <InfoModal
            isVisible={showInfo}
            model={currentModel}
            onClose={() => setShowInfo(false)}
          />
        )}
      </SafeAreaView>
    </ErrorBoundary>
  );
};

// Keep styles the same
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F0F0F0',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6A1B9A',
    flex: 1,
    textAlign: 'center',
  },
  backButton: {
    padding: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000',
    overflow: 'hidden',
    position: 'relative',
  },
  arView: {
    flex: 1,
  },
  arLoadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    zIndex: 10,
  },
  arLoadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    gap: 20,
  },
  modelSelection: {
    padding: 16,
    backgroundColor: '#F6F8FA', 
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
    maxHeight: 180,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
    letterSpacing: 0.3,
  },
  modelCard: {
    width: 100,
    height: 100,
    marginRight: 12,
    borderRadius: 12,
    backgroundColor: '#FFF',
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedModelCard: {
    borderColor: '#6A1B9A',
    backgroundColor: '#F3E5F5',
  },
  modelTitle: {
    fontSize: 12,
    textAlign: 'center',
    color: '#333',
    marginTop: 4,
    fontWeight: '600',
  },
  trackingText: {
    fontFamily: 'Arial',
    fontSize: 28,
    color: '#FFFFFF',
    textAlignVertical: 'center',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6A1B9A',
    marginBottom: 10,
  },
  modalDescription: {
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
  },
  modalSubtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  partItem: {
    marginBottom: 15,
  },
  partName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6A1B9A',
  },
  partDescription: {
    fontSize: 14,
    color: '#666',
  },
  closeButton: {
    backgroundColor: '#6A1B9A',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoButton: {
    padding: 8,
  },
  selectedModelTitle: {
    color: '#6A1B9A',
    fontWeight: 'bold',
  },
  cardIcon: {
    marginBottom: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  permissionText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  permissionButton: {
    backgroundColor: '#6A1B9A',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    fontFamily: 'Arial',
    fontSize: 28,
    color: '#FF0000',
    textAlignVertical: 'center',
    textAlign: 'center',
  },
  modelScrollContent: {
    paddingVertical: 8,
    paddingBottom: 12,
  },
  enhancedModelCard: {
    width: 100,
    height: 130,
    marginRight: 10,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    padding: 12,
    alignItems: 'center',
    justifyContent: 'flex-start',
    borderWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  enhancedSelectedModelCard: {
    backgroundColor: '#6A1B9A',
    shadowColor: '#6A1B9A',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  modelIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F3E5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#6A1B9A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  enhancedModelTitle: {
    fontSize: 12,
    textAlign: 'center',
    color: '#333',
    fontWeight: '600',
    width: '100%',
  },
  enhancedSelectedModelTitle: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  modelBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(106, 27, 154, 0.2)',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  modelBadgeText: {
    fontSize: 8,
    color: '#6A1B9A',
    fontWeight: 'bold',
  },
});

// Register spinner material
try {
  ViroAnimations.registerAnimations({
    rotate: {
      properties: {
        rotateY: "+=90"
      },
      duration: 3000,
    },
    // Add loading spinner animation
    spinLoader: {
      properties: {
        rotateZ: "+=360"
      },
      duration: 1500,
      easing: "Linear"
    }
  });
  
  // Create materials for spinner
  const materials = {
    spinnerMaterial: {
      lightingModel: "Constant" as const,
      diffuseColor: "#FFFFFF",
    },
  };
  
  // Register materials for ViroSphere
  ViroMaterials.createMaterials(materials);
  
  console.log('✅ ViroAnimations and materials registered successfully');
} catch (error) {
  console.error('Failed to register animations or materials:', error);
}

export default React.memo(ARLearnScreen); 