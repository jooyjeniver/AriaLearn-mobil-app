import React from 'react';
import { View, Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useRoute } from '@react-navigation/native';
import MyLessonsScreen from '../screens/MyLessonsScreen';
import type { SubjectStackParamList } from '../types/navigation';

const Stack = createNativeStackNavigator<SubjectStackParamList>();

// Temporary Subject Screen component
const SubjectScreen: React.FC<any> = ({ route }) => {
  const { lessonId } = route.params;
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 18, marginBottom: 10 }}>
        {route.name} Lesson
      </Text>
      <Text style={{ color: '#666' }}>Lesson ID: {lessonId}</Text>
    </View>
  );
};

const SubjectNavigator = () => {
  const route = useRoute();
  const isMyLessons = route.name === 'My Lessons';

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
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
        component={MyLessonsScreen}
        options={{ 
          headerShown: false,
          title: isMyLessons ? 'My Lessons' : 'Home'
        }}
      />
      <Stack.Screen
        name="Science"
        component={SubjectScreen}
        options={{
          title: 'Science',
        }}
      />
      <Stack.Screen
        name="Mathematics"
        component={SubjectScreen}
        options={{
          title: 'Mathematics',
        }}
      />
      <Stack.Screen
        name="Language"
        component={SubjectScreen}
        options={{
          title: 'Language',
        }}
      />
      <Stack.Screen
        name="Social Studies"
        component={SubjectScreen}
        options={{
          title: 'Social Studies',
        }}
      />
      <Stack.Screen
        name="Music"
        component={SubjectScreen}
        options={{
          title: 'Music',
        }}
      />
      <Stack.Screen
        name="Art"
        component={SubjectScreen}
        options={{
          title: 'Art',
        }}
      />
    </Stack.Navigator>
  );
};

export default SubjectNavigator; 