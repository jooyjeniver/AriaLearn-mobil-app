import React, { useEffect, useRef, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  TouchableOpacity, 
  Alert,
  Platform,
  PermissionsAndroid
} from 'react-native';
import { Camera, CameraType } from 'react-native-camera-kit';
import { useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useEmotionAnalyzer } from '../hooks/useEmotionAnalyzer';
import { API } from '../config/api';

const EmotionCapture: React.FC = () => {
  const navigation = useNavigation();
  const cameraRef = useRef<any>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isCameraReady, setCameraReady] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { analyzeEmotion, loading, error, emotionData, isMockData, retry } = useEmotionAnalyzer();

  useEffect(() => {
    // Request camera permission if not granted
    requestCameraPermission();
  }, []);

  useEffect(() => {
    // Navigate to chart screen when emotion data is available
    if (emotionData && !loading) {
      navigation.navigate('EmotionChart' as never);
    }
  }, [emotionData, loading, navigation]);

  const requestCameraPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'AriaLearn needs access to your camera to detect emotions',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          setHasPermission(true);
          setCameraReady(true);
        } else {
          setHasPermission(false);
        }
      } else {
        // iOS permissions are handled by the camera component
        setHasPermission(true);
        setCameraReady(true);
      }
    } catch (err) {
      console.error('Failed to request camera permission:', err);
      setHasPermission(false);
    }
  };

  useEffect(() => {
    // Take photo automatically when camera is ready
    if (isCameraReady && hasPermission && !isProcessing) {
      setTimeout(capturePhoto, 1000); // Wait a second before capturing to ensure camera is fully initialized
    }
  }, [isCameraReady, hasPermission]);

  const capturePhoto = async () => {
    if (cameraRef.current && hasPermission && !isProcessing) {
      try {
        setIsProcessing(true);
        
        // Take photo with CameraKit
        const image = await cameraRef.current.capture();
        
        // Process the captured photo
        processCapturedPhoto(image.uri);
      } catch (e) {
        console.error('Failed to take photo:', e);
        Alert.alert(
          'Camera Error',
          'Failed to capture photo. Please try again.',
          [{ text: 'Retry', onPress: () => setIsProcessing(false) }]
        );
      }
    }
  };

  const processCapturedPhoto = async (path: string) => {
    try {
      // Send to the API using the custom hook
      await analyzeEmotion(path);
    } catch (e) {
      console.error('Failed to process photo:', e);
      Alert.alert(
        'Processing Error',
        'Failed to analyze emotion. Please try again.',
        [{ text: 'Retry', onPress: () => setIsProcessing(false) }]
      );
    }
  };

  // Debug information
  useEffect(() => {
    console.log('============ ENVIRONMENT DEBUG INFO ============');
    console.log('Platform:', Platform.OS);
    console.log('API URL:', API.EMOTION_API);
    console.log('Development mode:', __DEV__ ? 'Yes' : 'No');
    
    // Check if the device can reach the API endpoint
    fetch(API.EMOTION_API.split('/api')[0])
      .then(response => {
        console.log('API base URL is reachable. Status:', response.status);
      })
      .catch(error => {
        console.log('API base URL is not reachable:', error.message);
        console.log('This could indicate network connectivity issues or incorrect API URL');
      });
    
    console.log('==============================================');
  }, []);

  // Render loading state if waiting for device or camera permission
  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionContainer}>
          <MaterialCommunityIcons name="camera-off" size={60} color="#F44336" />
          <Text style={styles.permissionText}>
            Camera permission is required to detect emotions
          </Text>
          <TouchableOpacity 
            style={styles.permissionButton} 
            onPress={requestCameraPermission}
          >
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Render error state if there's an error with the API
  if (error && !loading) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons name="alert-circle-outline" size={60} color="#F44336" />
          <Text style={styles.errorText}>
            Error detecting emotions: {error}
          </Text>
          <TouchableOpacity 
            style={styles.errorButton} 
            onPress={retry}
          >
            <Text style={styles.errorButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {hasPermission && (
        <Camera
          ref={cameraRef}
          style={styles.camera}
          flashMode="auto"
          focusMode="on"
          zoomMode="on"
          cameraType={CameraType.Front}
          onReadCode={() => {}}
        />
      )}
      
      <View style={styles.processingContainer}>
        <ActivityIndicator size="large" color="#6A1B9A" />
        <Text style={styles.processingText}>
          {loading ? 'Analyzing your emotions...' : 'Preparing camera...'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    flex: 1,
    width: '100%',
    height: '100%',
    position: 'absolute',
    opacity: 0.1, // Make it slightly visible so we know it's working but not distracting
  },
  processingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  processingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#6A1B9A',
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  errorContainer: {
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 20,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  errorButton: {
    backgroundColor: '#6A1B9A',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  errorButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  permissionContainer: {
    alignItems: 'center',
    padding: 20,
  },
  permissionText: {
    marginTop: 20,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: '#6A1B9A',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EmotionCapture; 