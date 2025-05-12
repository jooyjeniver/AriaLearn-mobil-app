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

// Add a safe URL parsing function that doesn't use URL constructor
const safeParseUrl = (url: string): { protocol: string, host: string, path: string } => {
  try {
    // Default values
    const result = {
      protocol: 'https',
      host: 'example.com',
      path: ''
    };
    
    if (!url) return result;
    
    // Simple regex-based URL parsing
    const protocolMatch = url.match(/^(https?):\/\//i);
    if (protocolMatch) {
      result.protocol = protocolMatch[1].toLowerCase();
      // Remove protocol
      url = url.substring(protocolMatch[0].length);
    }
    
    // Split remaining URL by first slash to separate host and path
    const parts = url.split('/');
    if (parts.length > 0) {
      result.host = parts[0];
      result.path = '/' + parts.slice(1).join('/');
    }
    
    return result;
  } catch (error) {
    console.error('Error safely parsing URL:', error);
    return {
      protocol: 'https',
      host: 'example.com',
      path: ''
    };
  }
};

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

// Get file extension from URL safely without using URL constructor
const getFileExtension = (url: string): string => {
  try {
    if (!url) return 'glb'; // Default to glb if no URL
    
    // Remove query parameters and hash
    const cleanUrl = url.split('?')[0].split('#')[0];
    
    // Split by path separator and get the last part (filename)
    const parts = cleanUrl.split('/').pop()?.split('.') || [];
    
    // If there are parts and the last part exists, return it lowercase
    if (parts.length > 1) {
      return parts[parts.length - 1].toLowerCase();
    }
    
    // Default to GLB if no extension found
    return 'glb';
  } catch (error) {
    console.error('Error getting file extension:', error);
    return 'glb';
  }
};

// First, update the ARSceneProps interface to include support for pinch gestures
interface ARSceneProps {
  model: ARModel;
  scale: number;
  rotation: [number, number, number];
  onError?: (error: any) => void;
  onTrackingUpdated?: (state: ViroTrackingStateConstants, reason?: ViroTrackingReason) => void;
}

// Optimized AR Scene component with pinch-to-zoom and improved model switching
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
  
  // Refs for managing state
  const isMounted = useRef(true);
  const lastPinchDistance = useRef<number | null>(null);
  const currentModelId = useRef<string | null>(null);
  const modelChangeCount = useRef(0);
  
  // Reset state when model changes
  useEffect(() => {
    if (!model) return;
    
    // Check if model has changed
    if (model._id !== currentModelId.current) {
      modelChangeCount.current += 1;
      console.log(`Model changed to: ${model.name} (${model._id}), change count: ${modelChangeCount.current}`);
      
      // Reset all state variables for the new model
      setIsLoading(true);
      setModelLoaded(false);
      setErrorMessage(null);
      setModelLoadAttempts(0);
      
      // Reset the UI state
      setModelPosition([0, -0.1, -0.5]);
      setModelScale([0.2, 0.2, 0.2]);
      setModelRotation([0, 0, 0]);
      
      // Update current model ID
      currentModelId.current = model._id;
    }
  }, [model]);
  
  // Cleanup effect
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Handle tracking updates and forward to parent
  const handleTrackingUpdated = useCallback((state: ViroTrackingStateConstants, reason: ViroTrackingReason) => {
    if (!isMounted.current) return;
    
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

  // Use our new safe model source creator
  const safeModelSource = useMemo(() => {
    return createSafeModelSource(model);
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

  // Update the handleModelError function to better handle errors
  const handleModelError = useCallback((error: any) => {
    try {
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
    } catch (handlerError) {
      console.error("Error in error handler:", handlerError);
    }
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

  // Scale controls - now also used by pinch gesture
  const scaleModel = useCallback((scaleAction: string | number) => {
    setModelScale(current => {
      const [x, y, z] = current;
      
      // If we got a number, it's a direct scale factor from pinch
      if (typeof scaleAction === 'number') {
        // Limit scale to reasonable bounds
        const newScale = Math.max(0.05, Math.min(2.0, scaleAction));
        return [newScale, newScale, newScale] as [number, number, number];
      }
      
      // Otherwise it's a direction string
      const scaleChange = 0.05;
      switch(scaleAction) {
        case 'increase': return [x + scaleChange, y + scaleChange, z + scaleChange] as [number, number, number];
        case 'decrease': return [Math.max(0.05, x - scaleChange), Math.max(0.05, y - scaleChange), Math.max(0.05, z - scaleChange)] as [number, number, number];
        default: return current;
      }
    });
  }, []);

  // Handle pinch gesture for zooming
  const handlePinch = useCallback((pinchState: any, scaleFactor: number, source: any) => {
    if (pinchState === 1) { // Started
      lastPinchDistance.current = scaleFactor;
    } else if (pinchState === 2 && lastPinchDistance.current !== null) { // Changed
      // Calculate the difference from last pinch
      const scaleDiff = scaleFactor / lastPinchDistance.current;
      
      // Apply the scaling to current model scale
      setModelScale(currentScale => {
        const [x, y, z] = currentScale;
        const newScale = [
          x * scaleDiff,
          y * scaleDiff,
          z * scaleDiff
        ] as [number, number, number];
        
        // Limit the scale to reasonable bounds
        return [
          Math.max(0.05, Math.min(2.0, newScale[0])),
          Math.max(0.05, Math.min(2.0, newScale[1])),
          Math.max(0.05, Math.min(2.0, newScale[2]))
        ];
      });
      
      // Update for next change
      lastPinchDistance.current = scaleFactor;
    } else if (pinchState === 3) { // Ended
      lastPinchDistance.current = null;
    }
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
            text={`Loading ${model?.name || 'model'}...`}
            position={[0, -0.3, 0]}
            scale={[1, 1, 1]}
            width={2}
            height={2}
            style={{ fontSize: 16, color: 'white', textAlignVertical: 'center', textAlign: 'center' }}
          />
        </ViroNode>
      )}

      {/* Interactive 3D Model with pinch to zoom - use key from modelInfo to force reload */}
      <ViroNode 
        position={modelPosition} 
        scale={[0.8, 0.8, 0.8] as [number, number, number]} 
        rotation={[0, 0, 0] as [number, number, number]}
        onPinch={handlePinch}>
        <Viro3DObject
          key={safeModelSource.key} // Use key from safeModelSource to force recreation
          source={{ uri: safeModelSource.uri }}
          type={safeModelSource.type}
          scale={modelScale}
          rotation={modelRotation}
          highAccuracyEvents={true}
          animation={{ name: "rotate", run: modelLoaded, loop: true }}
          onLoadStart={() => {
            try {
              console.log(`Starting to load model: ${model?.name || 'unknown'} with key ${safeModelSource.key}`);
              setIsLoading(true);
              setModelLoaded(false);
              setErrorMessage(null);
            } catch (error) {
              console.error("Error in onLoadStart:", error);
            }
          }}
          onLoadEnd={() => {
            try {
              if (!isMounted.current) return;
              console.log(`Successfully loaded model: ${model?.name || 'unknown'} with key ${safeModelSource.key}`);
              setIsLoading(false);
              setModelLoaded(true);
            } catch (error) {
              console.error("Error in onLoadEnd:", error);
            }
          }}
          onError={handleModelError}
        />
      </ViroNode>

      {/* Model description text - only show if model is loaded */}
      {modelLoaded && showDescription && model && (
        <ViroText
          key={`desc-${safeModelSource.key}`} // Match the 3D object key
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

// Add an error boundary component for the AR scene
class ARErrorBoundary extends React.Component<
  { children: React.ReactNode; onError: () => void },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; onError: () => void }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("AR Error Boundary caught error:", error, errorInfo);
    this.props.onError();
  }

  render() {
    if (this.state.hasError) {
      // Render fallback UI
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Something went wrong with AR</Text>
          <Text style={styles.errorMessage}>The AR experience encountered an error.</Text>
          <TouchableOpacity 
            style={styles.errorButton}
            onPress={() => this.setState({ hasError: false })}
          >
            <Text style={styles.errorButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

// Add a global emergency fallback model for cases where model loading fails completely
// Use type assertion to avoid requiring all properties
const FALLBACK_MODEL = {
  _id: 'fallback',
  name: 'Fallback Box',
  description: 'A simple 3D box model for when other models cannot be loaded.',
  modelFile: 'https://storage.googleapis.com/actlab-public/models/Box.glb',
  fileType: 'GLB',
  scale: { x: 0.2, y: 0.2, z: 0.2 },
  rotation: { x: 0, y: 0, z: 0 }
} as ARModel;

// Add a reliable model loading wrapper to avoid URL constructor issues
const createSafeModelSource = (model: ARModel | null): { uri: string, type: "OBJ" | "GLB" | "VRX" | "GLTF", scale: [number, number, number], key: string } => {
  // Default fallback values
  const fallbackSource = {
    uri: "https://storage.googleapis.com/actlab-public/models/Box.glb",
    type: "GLB" as const,
    scale: [0.2, 0.2, 0.2] as [number, number, number],
    key: 'fallback-model'
  };
  
  if (!model || !model.modelFile) {
    console.log("No valid model provided, using fallback");
    return fallbackSource;
  }
  
  try {
    console.log(`Creating safe model source for: ${model.name}`);
    
    // Determine source URL safely (no URL constructor)
    let sourceUri: string;
    
    if (model.modelFile.startsWith('/uploads')) {
      // API path - concatenate with base URL
      sourceUri = `${API_CONFIG.BASE_URL}${model.modelFile}`;
    } else if (model.modelFile.startsWith('http://') || model.modelFile.startsWith('https://')) {
      // Already a full URL
      sourceUri = model.modelFile;
    } else {
      // Unknown format - use fallback
      console.warn(`Invalid model URL format: ${model.modelFile}`);
      return fallbackSource;
    }
    
    // Determine file type from extension or provided type
    let type: "OBJ" | "GLB" | "VRX" | "GLTF" = "GLB";
    if (model.fileType) {
      const fileType = model.fileType.toLowerCase();
      if (fileType === 'obj') type = 'OBJ';
      else if (fileType === 'glb') type = 'GLB';
      else if (fileType === 'gltf') type = 'GLTF';
      else if (fileType === 'vrx') type = 'VRX';
    } else {
      // Try to determine from URL
      const ext = sourceUri.split('.').pop()?.toLowerCase();
      if (ext === 'obj') type = 'OBJ';
      else if (ext === 'glb') type = 'GLB';
      else if (ext === 'gltf') type = 'GLTF';
      else if (ext === 'vrx') type = 'VRX';
    }
    
    // Extract scale safely
    let scale: [number, number, number] = [0.2, 0.2, 0.2];
    if (model.scale && typeof model.scale === 'object' && 'x' in model.scale) {
      scale = [model.scale.x, model.scale.y, model.scale.z];
    }
    
    console.log(`Model source resolved: ${sourceUri}, type: ${type}`);
    
    return {
      uri: sourceUri,
      type,
      scale,
      key: `model-${model._id}-${Date.now()}`
    };
  } catch (error) {
    console.error("Error creating safe model source:", error);
    return fallbackSource;
  }
};

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
  const [resetKey, setResetKey] = useState(0); // Used to force re-renders
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
  
  // Enhanced model selection with complete unmount/remount cycle to avoid URL constructor issues
  const handleModelSelection = useCallback((selectedModel: ARModel) => {
    try {
      // Validation check - ensure the model has required properties
      if (!selectedModel || !selectedModel._id) {
        console.warn('Invalid model selected:', selectedModel);
        return;
      }

      // Only change if selecting a different model
      if (currentModel?._id !== selectedModel._id) {
        console.log(`Selecting new model: ${selectedModel.name} (${selectedModel._id})`);
        
        // Validate model data - check if either modelFile exists 
        const hasModelFile = Boolean(selectedModel.modelFile);
        
        if (!hasModelFile) {
          console.warn('Selected model has no modelFile:', selectedModel);
          Alert.alert(
            'Model Not Available',
            'This 3D model cannot be displayed. Please select another model.',
            [{ text: 'OK' }]
          );
          return;
        }
        
        // Show loading state
        setArSceneLoading(true);
        
        // Reset model load attempts
        setModelLoadAttempts(0);
        
        // IMPORTANT: First, completely remove the AR navigator from the view
        setArViewActive(false);
        
        // Clear any previous timeouts to prevent race conditions
        if (window.modelSelectionTimeout) {
          clearTimeout(window.modelSelectionTimeout);
          window.modelSelectionTimeout = null;
        }
        
        // Use a significant timeout to ensure complete cleanup 
        const timeoutId = setTimeout(() => {
          try {
            // Make sure component is still mounted
            if (!isMounted.current) return;
            
            // Force a complete re-render with a new key
            setResetKey(prevKey => prevKey + 1);
            
            // THEN update the selected model in Redux
            dispatch(selectModel(selectedModel));
            
            // Wait a bit more before re-enabling the AR view
            setTimeout(() => {
              if (!isMounted.current) return;
              
              // Only now re-enable the AR view with the new model
              setArViewActive(true);
              
              console.log(`Model selection complete for ${selectedModel.name}`);
            }, 100);
          } catch (timeoutError) {
            console.error('Error in model selection timeout handler:', timeoutError);
            // If an error occurs, still try to recover by re-enabling the AR view
            setArViewActive(true);
          }
        }, 500); // Extended timeout for more reliable cleanup
        
        // Store the timeout ID
        window.modelSelectionTimeout = timeoutId;
      }
    } catch (error) {
      console.error('Error in handleModelSelection:', error);
      
      // Recovery: Make sure AR view is active
      setArViewActive(true);
      
      // Show error to user
      Alert.alert(
        'Error',
        'Failed to select the model. Please try again.',
        [{ text: 'OK' }]
      );
    }
  }, [currentModel, dispatch, setArSceneLoading, isMounted]);
  
  // This useEffect will handle model changes and make sure we reset AR state
  useEffect(() => {
    if (currentModel) {
      console.log(`Current model set to: ${currentModel.name}`);
    }
  }, [currentModel]);
  
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
            <ARErrorBoundary 
              onError={() => {
                console.log("AR Error boundary triggered");
                setArSceneLoading(false);
                
                // Restart AR view with delay
                setArViewActive(false);
                setTimeout(() => {
                  setResetKey(prev => prev + 1);
                  setArViewActive(true);
                }, 500);
              }}
            >
              <ViroARSceneNavigator
                key={`ar-nav-${resetKey}`} // Use only resetKey to ensure complete recreation
                autofocus={true}
                initialScene={{
                  scene: () => {
                    try {
                      // Safe model preparation outside of ARScene to avoid URL constructor issues
                      const modelSource = createSafeModelSource(currentModel || FALLBACK_MODEL);
                      
                      // Log source information for debugging
                      console.log(`Creating AR scene with model source: ${modelSource.uri}`);
                      
                      return (
                        <ARScene 
                          model={currentModel || FALLBACK_MODEL}
                          scale={scale}
                          rotation={rotation}
                          onError={(error) => {
                            try {
                              console.log('🔄 ARScene error:', error);
                              
                              // Show an alert if all fallbacks have failed
                              if (error.critical) {
                                Alert.alert(
                                  'Error Loading 3D Model',
                                  'We could not load the 3D model. Please check your internet connection and try again.',
                                  [{ 
                                    text: 'OK', 
                                    onPress: () => {
                                      // Try to recover by forcing the scene to reset
                                      setResetKey(prev => prev + 1);
                                    } 
                                  }]
                                );
                              }
                              
                              // Update loading state
                              handleARSceneLoading(false);
                              // Increment model load attempts
                              setModelLoadAttempts(prev => prev + 1);
                            } catch (handlerError) {
                              console.error('Error handling ARScene error:', handlerError);
                            }
                          }}
                          // Pass tracking update handler to ARScene
                          onTrackingUpdated={(state) => {
                            try {
                              // When tracking becomes normal, we know AR is initialized
                              if (state === ViroTrackingStateConstants.TRACKING_NORMAL) {
                                handleARSceneLoading(false);
                              }
                            } catch (error) {
                              console.error('Error in tracking update handler:', error);
                            }
                          }}
                        />
                      );
                    } catch (sceneError) {
                      console.error("Error rendering AR scene:", sceneError);
                      // Return a minimal scene if main scene fails
                      return (
                        <ViroARScene>
                          <ViroText
                            text="Error loading AR scene. Please try again."
                            position={[0, 0, -1]}
                            style={{ fontSize: 20, color: 'white', textAlignVertical: 'center', textAlign: 'center' }}
                          />
                        </ViroARScene>
                      );
                    }
                  },
                }}
                style={styles.arView}
                viroAppProps={{
                  safeModel: currentModel ? createSafeModelSource(currentModel) : null,
                  resetKey: resetKey
                }}
              />
            </ARErrorBoundary>
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
                  onPress={() => handleModelSelection(item)}
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
                  ]} numberOfLines={2} ellipsizeMode="tail">{item.name}</Text>
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
    maxHeight: 200,  // Increased from 180 to allow more space
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
    paddingBottom: 16,  // Increased padding to avoid cutting off
    paddingRight: 10,  // Added padding to the right
  },
  enhancedModelCard: {
    width: 100,
    height: 140,  // Increased from 130 to fit content better
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
    overflow: 'visible',  // Ensure nothing gets cut off
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
    height: 32,  // Fixed height to accommodate two lines
    flexWrap: 'wrap',  // Allow text to wrap
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
    zIndex: 1,  // Ensure badge appears on top
  },
  modelBadgeText: {
    fontSize: 8,
    color: '#6A1B9A',
    fontWeight: 'bold',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  errorMessage: {
    fontSize: 16,
    color: '#CCCCCC',
    textAlign: 'center',
    marginBottom: 24,
  },
  errorButton: {
    backgroundColor: '#6A1B9A',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  errorButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
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

// Add a type declaration for the window.modelSelectionTimeout property
declare global {
  interface Window {
    modelSelectionTimeout: NodeJS.Timeout | null;
  }
}

// Initialize the window.modelSelectionTimeout property if it doesn't exist
if (typeof window !== 'undefined' && window.modelSelectionTimeout === undefined) {
  window.modelSelectionTimeout = null;
}

export default React.memo(ARLearnScreen); 