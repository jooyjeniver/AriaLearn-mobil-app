import React, { useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import Toast, { ToastType } from './Toast';

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastManagerProps {
  children: React.ReactNode;
}

export const ToastContext = React.createContext<{
  showToast: (message: string, type: ToastType) => void;
}>({
  showToast: () => {},
});

export const ToastProvider: React.FC<ToastManagerProps> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [nextId, setNextId] = useState(1);

  const showToast = useCallback((message: string, type: ToastType) => {
    const id = nextId;
    setNextId(prev => prev + 1);
    
    setToasts(prev => [...prev, { id, message, type }]);
  }, [nextId]);

  const hideToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <View style={styles.container}>
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onHide={() => hideToast(toast.id)}
          />
        ))}
      </View>
    </ToastContext.Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    pointerEvents: 'box-none',
  },
});

export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}; 