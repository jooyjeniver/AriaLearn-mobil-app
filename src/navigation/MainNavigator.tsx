import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import HomeScreen from '../screens/HomeScreen';
import ARLearnScreen from '../screens/ARLearnScreen';
import MyLessonsScreen from '../screens/MyLessonsScreen';
import GamesScreen from '../screens/GamesScreen';
import ProgressScreen from '../screens/ProgressScreen';

const Tab = createBottomTabNavigator();

const CustomTabBarButton = ({ children, onPress }) => (
  <TouchableOpacity
    style={{
      position: 'absolute',
      top: -30,
      justifyContent: 'center',
      alignItems: 'center',
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: '#9C27B0',
    }}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <View style={{
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      {children}
    </View>
  </TouchableOpacity>
);

const MainNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#9C27B0',
        tabBarInactiveTintColor: '#757575',
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: true,
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="AR Learn"
        component={ARLearnScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="camera" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="My Lessons"
        component={MyLessonsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="book-open-variant" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Games"
        component={GamesScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="gamepad-variant" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Progress"
        component={ProgressScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="chart-line" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    borderTopWidth: 0,
    elevation: 0,
    height: 60,
    backgroundColor: '#FFFFFF',
  },
});

export default MainNavigator;