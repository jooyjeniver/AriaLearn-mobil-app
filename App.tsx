import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider } from 'react-redux';
import { store } from './src/store/store';
import Toast from 'react-native-toast-message';
import LoginScreen from './src/screens/auth/LoginScreen';
import SignupScreen from './src/screens/auth/SignupScreen';
import ForgotPasswordScreen from './src/screens/auth/ForgotPasswordScreen';
// TODO: Create MainNavigator component in src/navigation/MainNavigator.tsx
import MainNavigator from './src/navigation/MainNavigator';
import { useAppSelector } from './src/store/hooks';
import { ToastProvider } from './src/context/ToastContext';
import ARLearnScreen from './src/screens/ARLearnScreen';

const Stack = createNativeStackNavigator();

const AppContent = () => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          </>
        ) : (
          <Stack.Screen name="Main" component={MainNavigator} />
        )}
      </Stack.Navigator>
      <Toast />
    </NavigationContainer>
  );
};

const App = () => {
  return (
    <Provider store={store}>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </Provider>
  );
};

export default App;
