import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Animated,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

interface Lesson {
  id: string;
  title: string;
  description: string;
  duration: string;
  progress: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  icon: string;
}

interface SubjectScreenProps {
  title: string;
  description: string;
  mainColor: string;
  icon: string;
  lessons: Lesson[];
  onLessonPress: (lessonId: string) => void;
}

const LessonCard = ({ lesson, color, onPress }) => {
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

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        style={styles.lessonCard}
        onPress={() => onPress(lesson.id)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}>
        <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
          <MaterialCommunityIcons name={lesson.icon} size={32} color={color} />
        </View>
        <View style={styles.lessonContent}>
          <View style={styles.lessonHeader}>
            <Text style={styles.lessonTitle}>{lesson.title}</Text>
            <Text style={[styles.difficultyBadge, { backgroundColor: `${color}20`, color }]}>
              {lesson.difficulty}
            </Text>
          </View>
          <Text style={styles.lessonDescription}>{lesson.description}</Text>
          <View style={styles.lessonFooter}>
            <View style={styles.durationContainer}>
              <MaterialCommunityIcons name="clock-outline" size={14} color="#666" />
              <Text style={styles.duration}>{lesson.duration}</Text>
            </View>
            <View style={styles.progressContainer}>
              <View style={[styles.progressBar, { backgroundColor: `${color}20` }]}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${lesson.progress}%`, backgroundColor: color }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>{lesson.progress}%</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const SubjectScreen: React.FC<SubjectScreenProps> = ({
  title,
  description,
  mainColor,
  icon,
  lessons,
  onLessonPress,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'in-progress' | 'completed'>('all');

  const filteredLessons = lessons.filter(lesson => {
    switch (selectedFilter) {
      case 'in-progress':
        return lesson.progress > 0 && lesson.progress < 100;
      case 'completed':
        return lesson.progress === 100;
      default:
        return true;
    }
  });

  const overallProgress = Math.round(
    lessons.reduce((acc, lesson) => acc + lesson.progress, 0) / lessons.length
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: `${mainColor}20` }]}>
            <MaterialCommunityIcons name={icon} size={48} color={mainColor} />
          </View>
          <View style={styles.headerContent}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.description}>{description}</Text>
          </View>
        </View>

        <View style={styles.progressSection}>
          <Text style={styles.progressTitle}>Overall Progress</Text>
          <View style={styles.overallProgress}>
            <View style={[styles.progressBar, { backgroundColor: `${mainColor}20` }]}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${overallProgress}%`, backgroundColor: mainColor }
                ]} 
              />
            </View>
            <Text style={[styles.progressPercentage, { color: mainColor }]}>
              {overallProgress}%
            </Text>
          </View>
        </View>

        <View style={styles.filterSection}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedFilter === 'all' && { backgroundColor: `${mainColor}20` },
            ]}
            onPress={() => setSelectedFilter('all')}>
            <Text style={[styles.filterText, selectedFilter === 'all' && { color: mainColor }]}>
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedFilter === 'in-progress' && { backgroundColor: `${mainColor}20` },
            ]}
            onPress={() => setSelectedFilter('in-progress')}>
            <Text
              style={[
                styles.filterText,
                selectedFilter === 'in-progress' && { color: mainColor },
              ]}>
              In Progress
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedFilter === 'completed' && { backgroundColor: `${mainColor}20` },
            ]}
            onPress={() => setSelectedFilter('completed')}>
            <Text
              style={[
                styles.filterText,
                selectedFilter === 'completed' && { color: mainColor },
              ]}>
              Completed
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.lessonsList}>
          {filteredLessons.map(lesson => (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              color={mainColor}
              onPress={onLessonPress}
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
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#666',
  },
  progressSection: {
    padding: 16,
    backgroundColor: '#FFF',
    marginTop: 16,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  overallProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressPercentage: {
    fontSize: 16,
    fontWeight: 'bold',
    minWidth: 45,
  },
  filterSection: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFF',
  },
  filterText: {
    fontSize: 14,
    color: '#666',
  },
  lessonsList: {
    padding: 16,
    gap: 12,
  },
  lessonCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  lessonContent: {
    flex: 1,
  },
  lessonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  lessonTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  difficultyBadge: {
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  lessonDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  lessonFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  duration: {
    fontSize: 12,
    color: '#666',
  },
  progressContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 16,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    minWidth: 35,
  },
});

export default SubjectScreen; 