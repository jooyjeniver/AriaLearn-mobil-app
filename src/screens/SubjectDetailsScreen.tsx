import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Animated,
  Easing,
  Dimensions,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { MainStackParamList } from '../types/navigation';
import { useToast } from '../context/ToastContext';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchLessonDetail, selectCurrentLesson, selectLessonsLoading, selectLessonsError } from '../store/slices/lessonsSlice';
import KidsFriendlySubjectScreen from './KidsFriendlySubjectScreen';

// Get screen dimensions for responsive design
const { width, height } = Dimensions.get('window');

type SubjectDetailsScreenProps = {
  navigation: NativeStackNavigationProp<MainStackParamList, 'SubjectDetails'>;
  route: RouteProp<MainStackParamList, 'SubjectDetails'>;
};

const SubjectDetailsScreen: React.FC<SubjectDetailsScreenProps> = ({ navigation, route }) => {
  const { subjectId, subjectName = "Myself and My Family", subjectColor = '#FF6F00', subjectIcon = 'book-open-variant' } = route.params || {};
  const { showToast } = useToast();
  const dispatch = useAppDispatch();
  const currentLesson = useAppSelector(selectCurrentLesson);
  const loading = useAppSelector(selectLessonsLoading);
  const error = useAppSelector(selectLessonsError);
  
  // Animation values
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(100)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.8)).current;
  const bounceAnim = React.useRef(new Animated.Value(0)).current;
  const rotateAnim = React.useRef(new Animated.Value(0)).current;
  
  // Tab state
  const [activeTab, setActiveTab] = useState('lessons');
  
  // Sample data from your JSON - normally this would come from an API
  const moduleData = {
    "_id": "67f4096d8ded109df6ba0876",
    "title": "Who Am I",
    "description": "Learn about personal identity, family relationships, and responsibilities at home",
    "category": "Language",
    "difficulty": "beginner",
    "order": 1,
    "createdAt": "2025-05-13T10:46:05.885Z",
    "updatedAt": "2025-05-13T10:46:05.885Z",
    "__v": 0,
    "lessons": [
      {
        "title": "Who Am I?",
        "content": "Understand personal identity and basic personal information",
        "order": 1,
        "icon": "account"
      },
      {
        "title": "My Special Family Tree",
        "content": "Identify family members and understand relationships within a family",
        "order": 2,
        "icon": "account-group"
      },
      {
        "title": "Helping Hands at Home",
        "content": "Learn about responsibilities and teamwork in family life",
        "order": 3,
        "icon": "hand-heart"
      }
    ],
    "resources": [
      "https://yourcdn.com/images/who_am_i_1.png",
      "https://www.youtube.com/embed/example12345",
      "https://yourcdn.com/images/family_tree_1.png",
      "https://www.youtube.com/embed/familyTree123",
      "https://yourcdn.com/images/helping_hands_1.png",
      "https://www.youtube.com/embed/helpingHands456"
    ],
    "quizzes": [
      {
        "_id": "quiz001",
        "question": "What is your name?",
        "type": "open-ended",
        "placeholder": "Type your name here"
      },
      {
        "_id": "quiz002",
        "question": "Which of these is a part of your identity?",
        "type": "multiple-choice",
        "options": [
          "Your favorite color",
          "Your friend's name",
          "Your height",
          "Your school name"
        ],
        "answer": "Your favorite color"
      },
      {
        "_id": "quiz003",
        "question": "How old are you?",
        "type": "open-ended",
        "placeholder": "Type your age"
      },
      {
        "_id": "quiz004",
        "question": "Who is your father's father?",
        "type": "multiple-choice",
        "options": ["Uncle", "Grandfather", "Brother", "Cousin"],
        "answer": "Grandfather"
      },
      {
        "_id": "quiz005",
        "question": "Draw or list your family members",
        "type": "open-ended",
        "placeholder": "Write or draw here"
      },
      {
        "_id": "quiz006",
        "question": "Who helps you get ready for school?",
        "type": "open-ended",
        "placeholder": "Type your answer here"
      },
      {
        "_id": "quiz007",
        "question": "Which of these is a responsibility at home?",
        "type": "multiple-choice",
        "options": [
          "Watching TV",
          "Feeding the pet",
          "Sleeping",
          "Playing"
        ],
        "answer": "Feeding the pet"
      }
    ]
  };
  
  // Fetch lesson details when component mounts
  useEffect(() => {
    try {
      console.log('Fetching lesson details for ID:', subjectId);
      if (subjectId) {
        dispatch(fetchLessonDetail(subjectId));
      } else {
        console.error('Missing subjectId in route params!');
      }
    } catch (err) {
      console.error('Error fetching lesson:', err);
    }
  }, [dispatch, subjectId]);
  
  // Log current lesson when it changes
  useEffect(() => {
    console.log('Current lesson updated:', currentLesson);
  }, [currentLesson]);

  // Handle errors
  useEffect(() => {
    if (error) {
      showToast(error, 'error');
    }
  }, [error, showToast]);
  
  // Run animations on component mount
  useEffect(() => {
    const startAnimations = () => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        })
      ]).start();
      
      // Bounce animation for interactive elements
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: 1,
            duration: 1500,
            easing: Easing.bounce,
            useNativeDriver: true
          }),
          Animated.timing(bounceAnim, {
            toValue: 0,
            duration: 1500,
            easing: Easing.bounce,
            useNativeDriver: true
          })
        ])
      ).start();
      
      // Rotation animation
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 6000,
          useNativeDriver: true
        })
      ).start();
    };
    
    startAnimations();
  }, []);
  
  // Interpolate animations
  const bounce = bounceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -15]
  });
  
  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });
  
  // Rainbow colors for kid-friendly UI
  const colors = ['#FF9800', '#4CAF50', '#2196F3', '#9C27B0', '#F44336', '#009688'];
  
  // Render an individual lesson card
  const renderLessonCard = (lesson, index) => {
    const cardColor = colors[index % colors.length];
    
    return (
      <Animated.View 
        key={`lesson-${index}`}
        style={[
          styles.lessonCard,
          {
            backgroundColor: '#FFFFFF',
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
            marginTop: index === 0 ? 0 : 15,
            borderWidth: 2,
            borderColor: cardColor,
          }
        ]}
      >
        <View style={[styles.lessonHeader, { backgroundColor: cardColor }]}>
          <MaterialCommunityIcons name={lesson.icon} size={24} color="#FFFFFF" />
          <Text style={styles.lessonTitle}>{lesson.title}</Text>
          <View style={styles.orderBadge}>
            <Text style={styles.orderText}>{lesson.order}</Text>
          </View>
        </View>
        
        <View style={styles.lessonContent}>
          <Text style={styles.lessonDescription}>{lesson.content}</Text>
          
          <TouchableOpacity 
            style={[styles.startLessonButton, { backgroundColor: cardColor }]}
            onPress={() => {
              showToast(`Starting lesson: ${lesson.title}`, 'info');
              // Navigate to lesson detail screen
            }}
          >
            <MaterialCommunityIcons name="play-circle" size={22} color="#FFF" />
            <Text style={styles.startLessonText}>Start Learning!</Text>
          </TouchableOpacity>
          
          {/* Decorative elements */}
          <Animated.View 
            style={[
              styles.decorativeIcon,
              { transform: [{ translateY: bounce }] }
            ]}
          >
            <MaterialCommunityIcons 
              name={index % 2 === 0 ? "star" : "heart"} 
              size={30} 
              color={cardColor} 
            />
          </Animated.View>
        </View>
      </Animated.View>
    );
  };
  
  // Render a quiz card
  const renderQuizCard = (quiz, index) => {
    const cardColor = colors[index % colors.length];
    
    return (
      <Animated.View 
        key={`quiz-${index}`}
        style={[
          styles.quizCard,
          {
            backgroundColor: '#FFFFFF',
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
            marginTop: index === 0 ? 0 : 15,
          }
        ]}
      >
        <View style={[styles.quizHeader, { backgroundColor: cardColor }]}>
          <MaterialCommunityIcons 
            name={quiz.type === 'multiple-choice' ? "checkbox-multiple-marked-circle" : "pencil"} 
            size={24} 
            color="#FFFFFF" 
          />
          <Text style={styles.quizHeaderText}>Fun Question #{index + 1}</Text>
          <Animated.View style={{ transform: [{ rotate }] }}>
            <MaterialCommunityIcons name="star" size={20} color="#FFD700" />
          </Animated.View>
        </View>
        
        <View style={styles.quizContent}>
          <Text style={styles.quizQuestion}>{quiz.question}</Text>
          
          {quiz.type === 'multiple-choice' && (
            <View style={styles.optionsContainer}>
              {quiz.options.map((option, optionIndex) => (
                <TouchableOpacity 
                  key={`option-${optionIndex}`}
                  style={[
                    styles.optionButton,
                    { 
                      backgroundColor: `${cardColor}20`,
                      borderColor: cardColor
                    }
                  ]}
                  onPress={() => showToast(option === quiz.answer ? 'Correct!' : 'Try again!', option === quiz.answer ? 'success' : 'error')}
                >
                  <Text style={[styles.optionText, { color: cardColor }]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          
          {quiz.type === 'open-ended' && (
            <View style={[styles.openEndedInput, { borderColor: cardColor }]}>
              <Text style={{ color: '#999', fontStyle: 'italic' }}>{quiz.placeholder}</Text>
            </View>
          )}
        </View>
      </Animated.View>
    );
  };
  
  // Super fun loading screen for kids
  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <View style={{
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#FFFFFF',
          borderRadius: 20,
          padding: 30,
          width: width * 0.8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 5,
          elevation: 8,
        }}>
          <ActivityIndicator size="large" color={subjectColor} />
          
          <MaterialCommunityIcons 
            name="robot-excited" 
            size={100} 
            color={subjectColor}
            style={{ marginVertical: 20 }}
          />
          
          <Text style={{
            fontSize: 24,
            fontWeight: 'bold',
            color: subjectColor,
            textAlign: 'center',
            marginBottom: 10
          }}>
            Getting Ready For Fun!
          </Text>
          
          {/* Animation dots for kids */}
          <View style={{ flexDirection: 'row', marginTop: 20 }}>
            {['#FF4081', '#3F51B5', '#FF9800', '#4CAF50', '#9C27B0'].map((color, i) => (
              <View 
                key={i}
                style={{
                  width: 15,
                  height: 15,
                  borderRadius: 10,
                  backgroundColor: color,
                  margin: 5
                }}
              />
            ))}
          </View>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.container}>
        {/* Header with title and back button */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialCommunityIcons name="arrow-left" size={28} color={subjectColor} />
          </TouchableOpacity>
          
          <Animated.View 
            style={{
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }]
            }}
          >
            <Text style={[styles.headerTitle, { color: subjectColor }]}>
              {moduleData.title}
            </Text>
          </Animated.View>
        </View>
        
        {/* Hero section with module info */}
        <Animated.View 
          style={[
            styles.heroSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <View style={styles.heroContent}>
            <View style={[styles.iconContainer, { backgroundColor: subjectColor }]}>
              <MaterialCommunityIcons name="family-tree" size={50} color="#FFF" />
              
              {/* Spinning star decoration */}
              <Animated.View 
                style={[
                  styles.starDecoration,
                  { transform: [{ rotate }] }
                ]}
              >
                <MaterialCommunityIcons name="star" size={24} color="#FFD700" />
              </Animated.View>
              
              {/* Bouncing balloon decoration */}
              <Animated.View 
                style={[
                  styles.balloonDecoration,
                  { transform: [{ translateY: bounce }] }
                ]}
              >
                <MaterialCommunityIcons name="balloon" size={30} color="#FF4081" />
            </Animated.View>
          </View>
          
            <Text style={styles.categoryBadge}>{moduleData.category}</Text>
            
            <Text style={styles.moduleDescription}>
              {moduleData.description}
            </Text>
            
            <View style={styles.difficultyContainer}>
              <MaterialCommunityIcons 
                name="signal-variant" 
                size={22} 
                color="#4CAF50" 
              />
              <Text style={styles.difficultyText}>
                Difficulty: <Text style={{ fontWeight: 'bold', textTransform: 'capitalize' }}>{moduleData.difficulty}</Text>
            </Text>
          </View>
            </View>
        </Animated.View>
        
        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[
              styles.tabButton, 
              activeTab === 'lessons' && [styles.activeTab, { borderColor: subjectColor }]
            ]}
            onPress={() => setActiveTab('lessons')}
          >
              <MaterialCommunityIcons 
              name="book-open-variant" 
              size={24} 
              color={activeTab === 'lessons' ? subjectColor : '#757575'} 
            />
            <Text 
              style={[
                styles.tabText, 
                { color: activeTab === 'lessons' ? subjectColor : '#757575' }
              ]}
            >
              Lessons
              </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.tabButton, 
              activeTab === 'quizzes' && [styles.activeTab, { borderColor: subjectColor }]
            ]}
            onPress={() => setActiveTab('quizzes')}
          >
            <MaterialCommunityIcons 
              name="head-question" 
              size={24} 
              color={activeTab === 'quizzes' ? subjectColor : '#757575'} 
            />
            <Text 
              style={[
                styles.tabText, 
                { color: activeTab === 'quizzes' ? subjectColor : '#757575' }
              ]}
            >
              Fun Quiz
                </Text>
          </TouchableOpacity>
          </View>
  
        {/* Content Area */}
        <ScrollView 
          style={styles.contentScrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Lessons Tab */}
          {activeTab === 'lessons' && (
            <View>
              <Animated.View 
                style={[
                  styles.sectionTitleContainer,
                  {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
                  }
                ]}
              >
                <MaterialCommunityIcons name="bookmark" size={24} color={subjectColor} />
                <Text style={[styles.sectionTitle, { color: subjectColor }]}>
                  My Learning Journey
              </Text>
              </Animated.View>
              
              {moduleData.lessons.map((lesson, index) => renderLessonCard(lesson, index))}
              </View>
          )}
          
          {/* Quizzes Tab */}
          {activeTab === 'quizzes' && (
            <View>
              <Animated.View 
                style={[
                  styles.sectionTitleContainer,
                  {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
                  }
                ]}
              >
                <MaterialCommunityIcons name="brain" size={24} color={subjectColor} />
                <Text style={[styles.sectionTitle, { color: subjectColor }]}>
                  Challenge Your Mind!
            </Text>
              </Animated.View>
              
              <View style={styles.quizInfoCard}>
                <MaterialCommunityIcons name="lightbulb-on" size={30} color="#FFB300" />
                <Text style={styles.quizInfoText}>
                  Answer these fun questions to test what you've learned!
              </Text>
            </View>
              
              {moduleData.quizzes.map((quiz, index) => renderQuizCard(quiz, index))}
              
              <Animated.View 
                style={[
                  styles.quizCompletionContainer,
                  {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }]
                  }
                ]}
              >
                <Text style={styles.quizCompletionText}>
                  Complete all questions to earn your special badge!
              </Text>
                <MaterialCommunityIcons name="medal" size={40} color="#FFD700" />
            </Animated.View>
            </View>
          )}
          
          <View style={styles.spacer} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F8FF',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  heroSection: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 20,
    paddingHorizontal: 15,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  heroContent: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  starDecoration: {
    position: 'absolute',
    top: -5,
    right: -5,
  },
  balloonDecoration: {
    position: 'absolute',
    bottom: -10,
    left: -10,
  },
  categoryBadge: {
    backgroundColor: '#E1F5FE',
    color: '#0288D1',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 15,
    fontWeight: 'bold',
    marginBottom: 10,
    overflow: 'hidden',
    fontSize: 14,
  },
  moduleDescription: {
    fontSize: 16,
    color: '#555555',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 15,
  },
  difficultyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  difficultyText: {
    color: '#388E3C',
    marginLeft: 5,
    fontSize: 14,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    flexDirection: 'row',
    borderRadius: 25,
  },
  activeTab: {
    backgroundColor: '#F5F5F5',
    borderWidth: 2,
  },
  tabText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  contentScrollView: {
    flex: 1,
    backgroundColor: '#F8F8FF',
  },
  contentContainer: {
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: 30,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  lessonCard: {
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  lessonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  lessonTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
    flex: 1,
  },
  orderBadge: {
    backgroundColor: '#FFFFFF',
    width: 25,
    height: 25,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  orderText: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#333333',
  },
  lessonContent: {
    padding: 15,
  },
  lessonDescription: {
    fontSize: 15,
    color: '#555555',
    marginBottom: 15,
  },
  startLessonButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  startLessonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 5,
  },
  decorativeIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  quizInfoCard: {
    backgroundColor: '#FFF9C4',
    padding: 15,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#FFF59D',
  },
  quizInfoText: {
    flex: 1,
    marginLeft: 10,
    color: '#5D4037',
    fontSize: 15,
  },
  quizCard: {
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  quizHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  quizHeaderText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
    flex: 1,
  },
  quizContent: {
    padding: 15,
  },
  quizQuestion: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 15,
  },
  optionsContainer: {
    marginTop: 5,
  },
  optionButton: {
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
  },
  optionText: {
    fontSize: 15,
  },
  openEndedInput: {
    padding: 12,
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: '#F9F9F9',
  },
  quizCompletionContainer: {
    marginTop: 25,
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFD700',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  quizCompletionText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 10,
  },
  spacer: {
    height: 50,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5FF',
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 22,
    color: '#6A1B9A',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

// Export the kid-friendly version
export default KidsFriendlySubjectScreen; 