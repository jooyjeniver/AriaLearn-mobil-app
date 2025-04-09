import { ToastAndroid, Platform } from 'react-native';
import { ToastType } from '../components/Toast';

const TOAST_DURATION = {
  SHORT: ToastAndroid.SHORT,
  LONG: ToastAndroid.LONG,
};

// This is a simple wrapper for the toast system
// In a real app, you would use the ToastManager directly
export const showToast = (message: string, type: ToastType = 'info', duration: number = TOAST_DURATION.SHORT) => {
  if (Platform.OS === 'android') {
    // For Android, use the native Toast
    ToastAndroid.showWithGravity(
      message,
      duration,
      ToastAndroid.BOTTOM
    );
  } else {
    // For iOS, we'll use our custom toast system
    // This will be handled by the ToastManager
    console.log(`[Toast] ${type.toUpperCase()}: ${message}`);
  }
};

export const showSuccessToast = (message: string) => {
  showToast(message, 'success');
};

export const showErrorToast = (message: string) => {
  showToast(message, 'error', TOAST_DURATION.LONG);
};

export const showInfoToast = (message: string) => {
  showToast(message, 'info');
}; 