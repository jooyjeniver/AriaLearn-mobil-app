import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootTabParamList, SubjectStackParamList } from '../types/navigation';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { fetchSubjects } from '../store/slices/subjectsSlice';

type HomeScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<RootTabParamList>,
  NativeStackNavigationProp<SubjectStackParamList>
>;

const SubjectCard = ({ 
  title, 
  icon, 
  color, 
  onPress 
}: { 
  title: string; 
  icon: string; 
  color: string; 
  onPress: () => void;
}) => (
  <TouchableOpacity 
    style={[styles.subjectCard, { backgroundColor: color }]} 
    onPress={onPress}
  >
    <MaterialCommunityIcons name={icon} size={32} color="#FFFFFF" />
    <Text style={styles.subjectTitle}>{title}</Text>
  </TouchableOpacity>
);

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { items: subjects, loading } = useAppSelector((state) => state.subjects);

  React.useEffect(() => {
    dispatch(fetchSubjects());
  }, [dispatch]);

  const handleSubjectPress = (subjectName: string) => {
    // Navigate to MyLessonsScreen using the tab navigator and pass the subject name
    navigation.navigate('My Lessons', { selectedFilter: subjectName });
  };

  const handleProfilePress = () => {
    // @ts-ignore - Ignoring type error for navigation between different navigators
    navigation.navigate('UserProfile' as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello, {user?.name || 'Student'}!</Text>
            <Text style={styles.subtitle}>What do you want to learn today?</Text>
          </View>
          <TouchableOpacity onPress={handleProfilePress}>
            <MaterialCommunityIcons name="account-circle" size={28} color="#6A1B9A" />
          </TouchableOpacity>
        </View>

        {/* Subject Grid */}
        <View style={styles.subjectsGrid}>
          {loading ? (
            <Text>Loading subjects...</Text>
          ) : (
            subjects?.map((subject) => (
              <SubjectCard
                key={subject._id}
                title={subject.name}
                icon={subject.icon}
                color={subject.color}
                onPress={() => handleSubjectPress(subject.name)}
              />
            ))
          )}
        </View>

        {/* Today's Challenge */}
        <TouchableOpacity style={styles.challengeCard}>
          <Text style={styles.challengeTitle}>Today's Challenge</Text>
          <Text style={styles.challengeDescription}>
            Complete your daily activities and earn special rewards!
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F8FF',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 10,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6A1B9A',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
  },
  subjectsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    justifyContent: 'space-between',
  },
  subjectCard: {
    width: '48%',
    aspectRatio: 1.5,
    borderRadius: 20,
    padding: 20,
    marginBottom: 15,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  subjectTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
    textAlign: 'center',
  },
  challengeCard: {
    backgroundColor: '#6C5CE7',
    margin: 20,
    borderRadius: 20,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  challengeTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  challengeDescription: {
    color: '#FFFFFF',
    opacity: 0.9,
    fontSize: 14,
  },
});

export default HomeScreen;
