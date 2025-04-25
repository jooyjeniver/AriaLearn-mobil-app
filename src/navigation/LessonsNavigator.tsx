import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MyLessonsScreen from '../screens/MyLessonsScreen';
import { LessonsStackParamList } from '../types/navigation';


const Stack = createNativeStackNavigator<LessonsStackParamList>();

const LessonsNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="LessonsList" 
        component={MyLessonsScreen} 
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default LessonsNavigator; 