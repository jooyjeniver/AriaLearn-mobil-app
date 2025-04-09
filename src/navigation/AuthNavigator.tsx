import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';
import ApiTest from '../components/ApiTest';

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
  ApiTest: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

const AuthNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen 
        name="ApiTest" 
        component={ApiTest}
        options={{
          headerShown: true,
          title: 'API Test',
        }}
      />
    </Stack.Navigator>
  );
};

export default AuthNavigator; 