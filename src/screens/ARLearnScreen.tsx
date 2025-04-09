import React, { useState, useEffect, useCallback, useMemo } from 'react';
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

interface ModelInfo {
  title: string;
  iconName: string;
  description: string;
  parts?: { name: string; description: string }[];
}

// Pre-require 3D models to improve loading time
const models = {
  'Human Heart': require('../assets/3d/heart.obj'),
  'Solar System': require('../assets/3d/solar_system.obj'),
  'Dinosaur': require('../assets/3d/dinosaur.obj'),
};

// Memoized model data
const modelData = {
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
  title: string;
  iconName: string;
  isSelected: boolean;
  onPress: () => void;
}

// Memoized components
const ModelCard = React.memo(({ title, iconName, isSelected, onPress }: ModelCardProps) => (
  <TouchableOpacity
    style={[styles.modelCard, isSelected && styles.selectedModelCard]}
    onPress={onPress}>
    <MaterialCommunityIcons 
      name={iconName} 
      size={40} 
      color={isSelected ? '#6A1B9A' : '#666666'} 
      style={styles.cardIcon} 
    />
    <Text style={[styles.modelTitle, isSelected && styles.selectedModelTitle]}>{title}</Text>
  </TouchableOpacity>
));

const LoadingView = React.memo(() => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#6A1B9A" />
    <Text style={styles.loadingText}>Loading AR Experience...</Text>
  </View>
));

const ARScene = React.memo(({ model, scale, rotation }: { model: string; scale: number; rotation: [number, number, number] }) => {
  const [trackingState, setTrackingState] = useState<ViroTrackingStateConstants>(
    ViroTrackingStateConstants.TRACKING_UNAVAILABLE
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const modelScale = useMemo(() => 
    [scale * 0.2, scale * 0.2, scale * 0.2] as [number, number, number],
    [scale]
  );

  const onInitialized = useCallback((state: ViroTrackingStateConstants, reason: ViroTrackingReason) => {
    setTrackingState(state);
    if (state === ViroTrackingStateConstants.TRACKING_NORMAL) {
      setIsLoading(false);
    }
  }, []);

  const modelSource = useMemo(() => {
    try {
      return models[model as keyof typeof models];
    } catch (err) {
      setError('Failed to load 3D model');
      return null;
    }
  }, [model]);

  if (error) {
    return (
      <ViroText
        text={error}
        scale={[0.5, 0.5, 0.5]}
        position={[0, 0, -1]}
        style={styles.errorText}
      />
    );
  }

  return (
    <ViroARScene onTrackingUpdated={onInitialized}>
      <ViroAmbientLight color="#FFFFFF" intensity={200} />
      <ViroSpotLight
        innerAngle={5}
        outerAngle={90}
        direction={[0, -1, -0.2]}
        position={[0, 3, 1]}
        color="#FFFFFF"
        castsShadow={true}
      />
      <ViroNode position={[0, 0, -1]} dragType="FixedToWorld" onDrag={() => {}}>
        <Viro3DObject
          source={modelSource}
          scale={modelScale}
          rotation={rotation}
          position={[0, 0, -1]}
          type="OBJ"
          animation={{name: "rotate", run: true, loop: true}}
          onLoadStart={() => setIsLoading(true)}
          onLoadEnd={() => setIsLoading(false)}
          onError={(event) => setError(`Error loading model: ${event}`)}
        />
      </ViroNode>
      {(trackingState !== ViroTrackingStateConstants.TRACKING_NORMAL || isLoading) && (
        <ViroText
          text={isLoading ? 'Loading...' : `AR Tracking: ${trackingState}`}
          scale={[0.5, 0.5, 0.5]}
          position={[0, 0, -1]}
          style={styles.trackingText}
        />
      )}
    </ViroARScene>
  );
});

const InfoModal = React.memo(({ isVisible, model, onClose }: { isVisible: boolean; model: string; onClose: () => void }) => (
  <Modal visible={isVisible} transparent animationType="slide">
    <View style={styles.modalContainer}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>{modelData[model].title}</Text>
        <Text style={styles.modalDescription}>{modelData[model].description}</Text>
        <Text style={styles.modalSubtitle}>Key Parts:</Text>
        {modelData[model].parts?.map((part, index) => (
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
));

const ARLearnScreen: React.FC = () => {
  const [selectedModel, setSelectedModel] = useState('Human Heart');
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState<[number, number, number]>([0, 0, 0]);
  const [showInfo, setShowInfo] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkCameraPermission();
  }, []);

  const checkCameraPermission = useCallback(async () => {
    try {
      const permission = Platform.OS === 'ios' 
        ? PERMISSIONS.IOS.CAMERA 
        : PERMISSIONS.ANDROID.CAMERA;
      
      const result = await check(permission);
      
      if (result === RESULTS.GRANTED) {
        setHasCameraPermission(true);
        setIsLoading(false);
      } else if (result === RESULTS.DENIED) {
        const permissionResult = await request(permission);
        setHasCameraPermission(permissionResult === RESULTS.GRANTED);
        setIsLoading(false);
      } else {
        Alert.alert(
          'Camera Permission Required',
          'Please enable camera access in your device settings to use AR features.',
          [{ text: 'OK', onPress: () => setIsLoading(false) }]
        );
      }
    } catch (error) {
      console.error('Error checking camera permission:', error);
      setIsLoading(false);
    }
  }, []);

  const handleZoomIn = useCallback(() => {
    setScale(prev => Math.min(prev + 0.2, 2));
  }, []);

  const handleZoomOut = useCallback(() => {
    setScale(prev => Math.max(prev - 0.2, 0.5));
  }, []);

  const handleReset = useCallback(() => {
    setScale(1);
    setRotation([0, 0, 0]);
  }, []);

  const handleRotate = useCallback(() => {
    setRotation(prev => [prev[0], prev[1] + 90, prev[2]]);
  }, []);

  const handleModelSelect = useCallback((title: string) => {
    setSelectedModel(title);
  }, []);

  const toggleInfo = useCallback(() => {
    setShowInfo(prev => !prev);
  }, []);

  if (isLoading) {
    return <LoadingView />;
  }

  if (!hasCameraPermission) {
    return (
      <View style={styles.permissionContainer}>
        <MaterialCommunityIcons name="camera-off" size={48} color="#6A1B9A" />
        <Text style={styles.permissionTitle}>Camera Permission Required</Text>
        <Text style={styles.permissionText}>
          Please enable camera access in your device settings to use AR features.
        </Text>
        <TouchableOpacity style={styles.permissionButton} onPress={checkCameraPermission}>
          <Text style={styles.permissionButtonText}>Check Permission Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{selectedModel}</Text>
          <Text style={styles.subtitle}>Tap and explore to learn more about the parts!</Text>
          <TouchableOpacity onPress={toggleInfo} style={styles.infoButton}>
            <MaterialCommunityIcons name="information" size={24} color="#6A1B9A" />
          </TouchableOpacity>
        </View>

        <View style={styles.cameraContainer}>
          <ViroARSceneNavigator
            autofocus={true}
            initialScene={{
              scene: () => <ARScene model={selectedModel} scale={scale} rotation={rotation} />,
            }}
            style={styles.arView}
          />
        </View>

        <View style={styles.controls}>
          <TouchableOpacity style={styles.controlButton} onPress={handleReset}>
            <MaterialCommunityIcons name="refresh" size={24} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlButton} onPress={handleZoomIn}>
            <MaterialCommunityIcons name="magnify-plus-outline" size={24} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlButton} onPress={handleZoomOut}>
            <MaterialCommunityIcons name="magnify-minus-outline" size={24} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlButton} onPress={handleRotate}>
            <MaterialCommunityIcons name="rotate-3d" size={24} color="#000" />
          </TouchableOpacity>
        </View>

        <View style={styles.modelSelection}>
          <Text style={styles.sectionTitle}>Choose a 3D Model:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {Object.entries(modelData).map(([key, model]) => (
              <ModelCard
                key={key}
                title={model.title}
                iconName={model.iconName}
                isSelected={selectedModel === model.title}
                onPress={() => handleModelSelect(model.title)}
              />
            ))}
          </ScrollView>
        </View>

        <InfoModal
          isVisible={showInfo}
          model={selectedModel}
          onClose={toggleInfo}
        />
      </SafeAreaView>
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    padding: 16,
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    margin: 16,
    flexDirection: 'column',
  },
  headerIcon: {
    position: 'absolute',
    right: 16,
    top: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6A1B9A',
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  cameraContainer: {
    flex: 1,
    margin: 16,
    backgroundColor: '#000',
    borderRadius: 16,
    overflow: 'hidden',
  },
  arView: {
    flex: 1,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 16,
    gap: 20,
  },
  controlButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modelSelection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  modelCard: {
    width: 120,
    height: 120,
    marginRight: 12,
    borderRadius: 12,
    backgroundColor: '#FFF',
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedModelCard: {
    borderColor: '#6A1B9A',
  },
  modelTitle: {
    fontSize: 12,
    textAlign: 'center',
    color: '#333',
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
    position: 'absolute',
    right: 16,
    top: 16,
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