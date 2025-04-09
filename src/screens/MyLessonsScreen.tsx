import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Animated,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import type { Lesson, Subject, SubjectType } from '../types/lessons';
import type { RootTabParamList, SubjectStackParamList, SubjectScreenNames } from '../types/navigation';

type NavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<RootTabParamList>,
  NativeStackNavigationProp<SubjectStackParamList>
>;

const SUBJECTS: { name: string; icon: string; color: string }[] = [
  { name: 'Science', icon: 'flask', color: '#4CAF50' },
  { name: 'Mathematics', icon: 'calculator', color: '#2196F3' },
  { name: 'Language', icon: 'book-alphabet', color: '#9C27B0' },
  { name: 'Social Studies', icon: 'earth', color: '#FF9800' },
  { name: 'Music', icon: 'music', color: '#E91E63' },
  { name: 'Art', icon: 'palette', color: '#3F51B5' },
];

const LESSONS: Lesson[] = [
  {
    id: '1',
    title: 'Animal Kingdom',
    description: 'Learn about different animal species and their habitats',
    duration: '15 min',
    progress: 75,
    icon: 'paw',
    subject: 'Science',
    difficulty: 'Beginner',
  },
  {
    id: '2',
    title: 'Addition & Subtraction',
    description: 'Practice basic math with fun examples',
    duration: '10 min',
    progress: 100,
    isComplete: true,
    icon: 'calculator',
    subject: 'Mathematics',
    difficulty: 'Beginner',
  },
  {
    id: '3',
    title: 'Solar System',
    description: 'Explore planets and space objects',
    duration: '20 min',
    progress: 30,
    icon: 'planet',
    subject: 'Science',
    difficulty: 'Intermediate',
  },
  {
    id: '4',
    title: 'Basic Grammar',
    description: 'Learn essential grammar rules',
    duration: '12 min',
    progress: 50,
    icon: 'book-alphabet',
    subject: 'Language',
    difficulty: 'Beginner',
  },
];

interface LessonCardProps extends Lesson {
  onPress: () => void;
}

const LessonCard: React.FC<LessonCardProps> = ({
  title,
  description,
  duration,
  progress,
  isComplete,
  icon,
  onPress,
  subject,
}) => {
  const scaleAnim = new Animated.Value(1);
  
  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const subjectColor = SUBJECTS.find(s => s.name === subject)?.color || '#6A1B9A';

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        style={styles.lessonCard}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.7}>
        <View style={styles.lessonContent}>
          <View style={[styles.iconContainer, { backgroundColor: `${subjectColor}20` }]}>
            <MaterialCommunityIcons name={icon} size={40} color={subjectColor} />
          </View>
          <View style={styles.lessonInfo}>
            <Text style={styles.lessonTitle}>{title}</Text>
            <Text style={styles.lessonDescription}>{description}</Text>
            <View style={styles.lessonMeta}>
              <MaterialCommunityIcons name="clock-outline" size={12} color="#666" />
              <Text style={styles.duration}>{duration}</Text>
              <View style={styles.progressContainer}>
                <Animated.View 
                  style={[
                    styles.progressBar, 
                    { 
                      width: `${progress}%`,
                      backgroundColor: subjectColor,
                    }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>{progress}% complete</Text>
              {isComplete && (
                <MaterialCommunityIcons name="check-circle" size={20} color="#4CAF50" />
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

interface SubjectButtonProps {
  subject: {
    name: string;
    icon: string;
    color: string;
  };
  isSelected: boolean;
  onPress: () => void;
}

const SubjectButton: React.FC<SubjectButtonProps> = ({ subject, isSelected, onPress }) => (
  <TouchableOpacity
    style={[
      styles.subjectButton,
      isSelected && { backgroundColor: `${subject.color}20` },
    ]}
    onPress={onPress}>
    <MaterialCommunityIcons
      name={subject.icon}
      size={24}
      color={isSelected ? subject.color : '#666'}
    />
    <Text
      style={[
        styles.subjectText,
        isSelected && { color: subject.color, fontWeight: 'bold' },
      ]}>
      {subject.name}
    </Text>
  </TouchableOpacity>
);

const MyLessonsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { width } = useWindowDimensions();
  const [selectedSubject, setSelectedSubject] = useState<string>('All');

  const filteredLessons = LESSONS.filter(
    lesson => selectedSubject === 'All' || lesson.subject === selectedSubject
  );

  const handleLessonPress = useCallback((lesson: Lesson) => {
    if (lesson.subject === 'Science' && lesson.title === 'Solar System') {
      navigation.navigate('AR Learn');
    } else {
      console.log("test")
    }
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.title}>My Learning Path</Text>
          <MaterialCommunityIcons name="om" size={24} color="#6A1B9A" />
        </View>

        <View style={styles.recommendationSection}>
          <Text style={styles.sectionTitle}>Today's Recommendation</Text>
          <Text style={styles.subtitle}>Based on your interests</Text>
          <TouchableOpacity 
            style={styles.recommendationCard}
            onPress={() => navigation.navigate('AR Learn')}>
            <MaterialCommunityIcons name="rocket" size={32} color="#6A1B9A" />
            <View style={styles.recommendationContent}>
              <Text style={styles.recommendationTitle}>Explore Space Adventure</Text>
              <Text style={styles.recommendationDescription}>
                Learn about planets and space objects in 3D
              </Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#6A1B9A" />
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.subjectsContainer}>
          <SubjectButton
            subject={{ name: 'All', icon: 'view-grid', color: '#6A1B9A' }}
            isSelected={selectedSubject === 'All'}
            onPress={() => setSelectedSubject('All')}
          />
          {SUBJECTS.map(subject => (
            <SubjectButton
              key={subject.name}
              subject={subject}
              isSelected={selectedSubject === subject.name}
              onPress={() => setSelectedSubject(subject.name)}
            />
          ))}
        </ScrollView>

        <View style={styles.lessonsSection}>
          <Text style={styles.sectionTitle}>Continue Learning</Text>
          {filteredLessons.map(lesson => (
            <LessonCard
              key={lesson.id}
              {...lesson}
              onPress={() => handleLessonPress(lesson)}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  recommendationSection: {
    padding: 16,
    backgroundColor: '#FFF',
    margin: 16,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  recommendationCard: {
    backgroundColor: '#F0E6FA',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  recommendationContent: {
    flex: 1,
    marginHorizontal: 12,
  },
  recommendationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6A1B9A',
    marginBottom: 4,
  },
  recommendationDescription: {
    fontSize: 14,
    color: '#666',
  },
  subjectsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  subjectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFF',
    marginRight: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  subjectText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  lessonsSection: {
    padding: 16,
  },
  lessonCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  lessonContent: {
    flexDirection: 'row',
    gap: 16,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lessonInfo: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  lessonDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  lessonMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  duration: {
    fontSize: 12,
    color: '#666',
  },
  progressContainer: {
    flex: 1,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
  },
});

export default MyLessonsScreen; 