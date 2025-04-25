import React, { lazy, Suspense } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import HomeScreen from '../screens/HomeScreen';
import ProgressScreen from '../screens/ProgressScreen';
import GamesScreen from '../screens/GamesScreen';
import UserProfileScreen from '../screens/UserProfileScreen';
import AuthNavigator from './AuthNavigator';
import LessonsNavigator from './LessonsNavigator';
import type { RootTabParamList, SubjectStackParamList, RootStackParamList } from '../types/navigation';
import { useAppSelector } from '../store/hooks';

const Stack = createNativeStackNavigator<SubjectStackParamList>();
const Tab = createBottomTabNavigator<RootTabParamList>();
const RootStack = createNativeStackNavigator<RootStackParamList>();

// Loading component
const LoadingScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <ActivityIndicator size="large" color="#6A1B9A" />
  </View>
);

// Lazy load AR screen
const ARLearnScreen = lazy(() => import('../screens/ARLearnScreen'));

const SubjectStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: '#6A1B9A',
      },
      headerTintColor: '#FFF',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    }}>
    <Stack.Screen 
      name="HomeTab" 
      component={HomeScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="UserProfile" 
      component={UserProfileScreen}
      options={{
        headerTitle: 'Profile',
        headerBackTitle: 'Back',
        animation: 'slide_from_right',
      }}
    />
  </Stack.Navigator>
);

const TabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;

        switch (route.name) {
          case 'Home':
            iconName = focused ? 'home' : 'home-outline';
            break;
          case 'My Lessons':
            iconName = focused ? 'book-open-page-variant' : 'book-open-outline';
            break;
          case 'Progress':
            iconName = focused ? 'chart-line' : 'chart-line-variant';
            break;
          case 'Games':
            iconName = focused ? 'gamepad-variant' : 'gamepad-variant-outline';
            break;
          default:
            iconName = 'help';
        }

        return (
          <MaterialCommunityIcons
            name={iconName}
            size={size}
            color={color}
          />
        );
      },
      tabBarActiveTintColor: '#6A1B9A',
      tabBarInactiveTintColor: '#666666',
      headerShown: false,
    })}>
    <Tab.Screen name="Home" component={SubjectStack} />
    {/* <Tab.Screen name="My Lessons" component={LessonsNavigator} /> */}
    <Tab.Screen name="Progress" component={ProgressScreen} />
    <Tab.Screen name="Games" component={GamesScreen} />
  </Tab.Navigator>
);

const AppNavigator = () => {
  const { token } = useAppSelector((state) => state.auth);

  return (
    <NavigationContainer>
      <RootStack.Navigator>
        {!token ? (
          <RootStack.Screen 
            name="Auth" 
            component={AuthNavigator}
            options={{ headerShown: false }} 
          />
        ) : (
          <>
            <RootStack.Screen 
              name="Main" 
              component={TabNavigator}
              options={{ headerShown: false }} 
            />
            <RootStack.Screen
              name="AR Learn"
              component={() => (
                <Suspense fallback={<LoadingScreen />}>
                  <ARLearnScreen />
                </Suspense>
              )}
              options={{
                headerShown: false,
                presentation: 'fullScreenModal',
                animation: 'slide_from_bottom',
              }}
            />
          </>
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;