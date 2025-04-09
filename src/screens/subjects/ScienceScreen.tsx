import React from 'react';
import { useNavigation } from '@react-navigation/native';
import SubjectScreen from '../../components/SubjectScreen';
import { subjectData } from '../../types/lessons';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { RootTabParamList } from '../../types/navigation';

type NavigationProp = BottomTabNavigationProp<RootTabParamList>;

const ScienceScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { name, description, icon, color, lessons } = subjectData.Science;

  const handleLessonPress = (lessonId: string) => {
    const lesson = lessons.find(l => l.id === lessonId);
    if (lesson?.arEnabled) {
      navigation.navigate('AR Learn');
    }
  };

  return (
    <SubjectScreen
      title={name}
      description={description}
      mainColor={color}
      icon={icon}
      lessons={lessons}
      onLessonPress={handleLessonPress}
    />
  );
};

export default ScienceScreen; 