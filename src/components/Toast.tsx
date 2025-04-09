import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet, View } from 'react-native';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  onHide: () => void;
}

const getToastStyle = (type: ToastType) => {
  switch (type) {
    case 'success':
      return {
        backgroundColor: '#4CAF50',
        color: '#FFFFFF',
        icon: '✓',
      };
    case 'error':
      return {
        backgroundColor: '#F44336',
        color: '#FFFFFF',
        icon: '✕',
      };
    case 'info':
      return {
        backgroundColor: '#2196F3',
        color: '#FFFFFF',
        icon: 'ℹ',
      };
  }
};

const Toast: React.FC<ToastProps> = ({ message, type, onHide }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(50)).current;
  const style = getToastStyle(type);

  useEffect(() => {
    // Fade in and slide up
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto hide after 3 seconds
    const timer = setTimeout(() => {
      // Fade out and slide down
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 50,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onHide();
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.View
      style={[
        styles.toastContainer,
        {
          backgroundColor: style.backgroundColor,
          opacity: fadeAnim,
          transform: [{ translateY }],
        },
      ]}
    >
      <Text style={styles.toastIcon}>{style.icon}</Text>
      <Text style={[styles.toastText, { color: style.color }]}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    bottom: 50,
    left: 20,
    right: 20,
    padding: 15,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  toastIcon: {
    fontSize: 20,
    marginRight: 10,
    color: '#FFFFFF',
  },
  toastText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default Toast; 