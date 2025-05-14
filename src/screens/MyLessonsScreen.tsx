import React, { useCallback, useState, useEffect } from 'react';
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
  ActivityIndicator,
  Image,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { CompositeNavigationProp, RouteProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import type { Lesson, Subject, SubjectType, Difficulty } from '../types/lessons';
import type { RootTabParamList, SubjectStackParamList, MainStackParamList } from '../types/navigation';
import { useToast } from '../context/ToastContext';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchModules, selectModules, selectModulesLoading, selectModulesError, Module } from '../store/slices/modulesSlice';

type NavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<RootTabParamList>,
  NativeStackNavigationProp<SubjectStackParamList>
>;

type RouteProps = RouteProp<RootTabParamList, 'My Lessons'>;

// Add a type for the navigation prop
type MyLessonsScreenNavigationProp = NativeStackNavigationProp<MainStackParamList>;

interface ModuleCardProps {
  module: Module;
  onPress: () => void;
}

const ModuleCard: React.FC<ModuleCardProps> = ({ module, onPress }) => {
  const scaleAnim = new Animated.Value(1);
  const { showToast } = useToast();

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

  const handleModulePress = () => {
    showToast(`Opening ${module.title} module`, 'info');
    onPress();
  };

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        style={[styles.moduleCard, { borderLeftColor: module.color, borderLeftWidth: 4 }]}
        onPress={handleModulePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}>
        <View style={[styles.moduleIconContainer, { backgroundColor: `${module.color}20` }]}>
          <MaterialCommunityIcons name={module.icon} size={32} color={module.color} />
        </View>
        <View style={styles.moduleContent}>
          <Text style={styles.moduleTitle}>{module.title}</Text>
          <Text style={styles.moduleDescription}>{module.description}</Text>
          <View style={styles.moduleFooter}>
            <Text style={styles.moduleOrder}>Module {module._id}</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color={module.color} />
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

interface FilterButtonProps {
  title: string;
  isSelected: boolean;
  onPress: () => void;
  color: string;
}

const FilterButton: React.FC<FilterButtonProps> = ({ title, isSelected, onPress, color }) => (
  <TouchableOpacity
    style={[
      styles.filterButton,
      isSelected && { backgroundColor: `${color}20`, borderColor: color },
    ]}
    onPress={onPress}>
    <Text
      style={[
        styles.filterText,
        isSelected && { color: color, fontWeight: 'bold' },
      ]}>
      {title}
    </Text>
  </TouchableOpacity>
);

const MyLessonsScreen: React.FC = () => {
  const navigation = useNavigation<MyLessonsScreenNavigationProp>();
  const route = useRoute<RouteProps>();
  const { width } = useWindowDimensions();
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const { showToast } = useToast();
  const dispatch = useAppDispatch();
  const modules = useAppSelector(selectModules);
  const loading = useAppSelector(selectModulesLoading);
  const error = useAppSelector(selectModulesError);

  // Extract unique titles from modules for filtering
  const moduleTitles = React.useMemo(() => {
    const titles = new Set<string>();
    titles.add('All');
    modules.forEach(module => {
      if (module.title) {
        titles.add(module.title);
      }
    });
    return Array.from(titles);
  }, [modules]);

  useEffect(() => {
    dispatch(fetchModules());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      showToast(error, 'error');
    }
  }, [error, showToast]);

  // Set initial filter from navigation params
  useEffect(() => {
    if (route.params?.selectedFilter) {
      setSelectedFilter(route.params.selectedFilter);
      showToast(`Filtered by ${route.params.selectedFilter}`, 'info');
    }
  }, [route.params?.selectedFilter]);

  const handleModulePress = useCallback((module: Module) => {
    setSelectedModule(module._id);
    
    // Use getParent to access the root navigator that contains the SubjectDetails screen
    navigation.getParent()?.navigate('SubjectDetails', {
      subjectId: module._id, // This would come from your data in a real app
      subjectName: module.title,
      subjectColor: '#4CAF50', // Green for Science
      subjectIcon: 'microscope'
    });
    showToast(`Opening ${module.title} module`, 'info');
    console.log('Module pressed', module.lessons);
  }, [navigation, showToast]);

  const handleFilterChange = (filter: string) => {
    setSelectedFilter(filter);
    showToast(`Filtering by ${filter}`, 'info');
  };

  const filteredModules = selectedFilter === 'All' 
    ? modules 
    : modules.filter(module => {
        // Check if module title matches
        const moduleMatches = module.title.toLowerCase().includes(selectedFilter.toLowerCase());
        
        // Check if any lesson in the module matches
        const lessonsMatch = module.lessons?.some(lesson => 
          lesson.title.toLowerCase().includes(selectedFilter.toLowerCase())
        );

        return moduleMatches || lessonsMatch;
      });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6A1B9A" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.title}>My Learning Path</Text>
          <MaterialCommunityIcons name="book-open-variant" size={24} color="#6A1B9A" />
        </View>

        <View style={styles.recommendationSection}>
          <Text style={styles.sectionTitle}>Today's Recommendation</Text>
          <Text style={styles.subtitle}>Based on your interests</Text>
          <TouchableOpacity 
            style={styles.recommendationCard}
            onPress={() => {
              navigation.getParent()?.navigate('ARLearn');
              showToast('Starting AR Space Adventure! 🚀', 'info');
            }}>
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

        <View style={styles.filterSection}>
          <Text style={styles.sectionTitle}>Filter Modules</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterContainer}>
            {moduleTitles.map((title, index) => (
              <FilterButton 
                key={index}
                title={title} 
                isSelected={selectedFilter === title} 
                onPress={() => handleFilterChange(title)}
                color={title === 'All' ? '#6A1B9A' : 
                       title === 'Science' ? '#4CAF50' : 
                       title === 'Mathematics' ? '#2196F3' : 
                       title === 'Language' ? '#9C27B0' : 
                       title === 'Social Studies' ? '#FF9800' : 
                       title === 'Music' ? '#E91E63' : 
                       title === 'Art' ? '#3F51B5' : '#6A1B9A'}
              />
            ))}
          </ScrollView>
        </View>

        <View style={styles.modulesSection}>
          <Text style={styles.sectionTitle}>Available Modules</Text>
          {filteredModules.length > 0 ? (
            filteredModules.map(module => 
              module.lessons.map(lesson => (
                <ModuleCard
                  key={lesson._id}
                  module={{
                    ...module,
                    title: lesson.title,
                    description: lesson.description,
                    icon: lesson.icon || module.icon,
                    color: module.color
                  }}
                  onPress={() => handleModulePress({
                    ...module,
                    title: lesson.title,
                    description: lesson.description,
                    _id: lesson._id
                  } as Module)}
                />
              ))
            ).flat()
          ) : (
            <View style={styles.emptyStateContainer}>
              <MaterialCommunityIcons name="book-open-page-variant" size={48} color="#9E9E9E" />
              <Text style={styles.emptyStateText}>No modules found for this filter</Text>
            </View>
          )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  filterSection: {
    padding: 16,
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginBottom: 16,
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
  filterContainer: {
    paddingVertical: 8,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFF',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
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
  filterText: {
    fontSize: 14,
    color: '#666',
  },
  modulesSection: {
    padding: 16,
  },
  moduleCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
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
  moduleIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moduleContent: {
    flex: 1,
    marginLeft: 16,
  },
  moduleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  moduleDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  moduleFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  moduleOrder: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: '#FFF',
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
  emptyStateText: {
    fontSize: 16,
    color: '#9E9E9E',
    marginTop: 16,
    textAlign: 'center',
  },
  lessonsContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  lessonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  lessonTitle: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  },
});

export default MyLessonsScreen; 