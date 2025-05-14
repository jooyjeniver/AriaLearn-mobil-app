// src/screens/GamesScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Animated,
  Platform,
} from 'react-native';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '../store/hooks';
import { 
  answerQuestion, 
  fetchQuizzes, 
  nextQuestion, 
  resetCurrentQuiz, 
  selectQuiz,
  submitQuizScore 
} from '../store/slices/quizSlice';
import { RootState } from '../store/store';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../types/navigation';

interface Achievement {
  id: string;
  title: string;
  icon: string;
  isUnlocked: boolean;
  color: string;
  points: number;
  description: string;
  requirement: number;
  progress: number;
}

interface Game {
  id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  rating: number;
  points: number;
  subject: string;
  icon: string;
  color: string;
  bestScore?: number;
  timesPlayed: number;
  isQuiz?: boolean;
  quizData?: any;
}

const ACHIEVEMENTS: Achievement[] = [
  {
    id: '1',
    title: 'Math Whiz',
    icon: 'trophy',
    isUnlocked: true,
    color: '#FFD700',
    points: 50,
    description: 'Complete 5 math games with perfect score',
    requirement: 5,
    progress: 5,
  },
  {
    id: '2',
    title: 'Scientist',
    icon: 'medal',
    isUnlocked: true,
    color: '#FFD700',
    points: 50,
    description: 'Complete all science games',
    requirement: 3,
    progress: 3,
  },
  {
    id: '3',
    title: 'Explorer',
    icon: 'star',
    isUnlocked: false,
    color: '#C0C0C0',
    points: 30,
    description: 'Play games from all subjects',
    requirement: 6,
    progress: 4,
  },
  {
    id: '4',
    title: 'Artist',
    icon: 'trophy',
    isUnlocked: false,
    color: '#C0C0C0',
    points: 20,
    description: 'Complete 3 art challenges',
    requirement: 3,
    progress: 1,
  },
];

const GAMES: Game[] = [
  {
    id: '1',
    title: 'Math Challenge',
    description: 'Test your addition and subtraction skills!',
    difficulty: 'Easy',
    rating: 3,
    points: 10,
    subject: 'Mathematics',
    icon: 'calculator',
    color: '#2196F3',
    bestScore: 95,
    timesPlayed: 5,
  },
  {
    id: '2',
    title: 'World Travel',
    description: 'Explore different countries and cultures',
    difficulty: 'Medium',
    rating: 4,
    points: 15,
    subject: 'Social Studies',
    icon: 'earth',
    color: '#FF9800',
    bestScore: 85,
    timesPlayed: 3,
  },
  {
    id: '3',
    title: 'Science Quiz',
    description: 'Test your knowledge of basic science concepts',
    difficulty: 'Medium',
    rating: 4,
    points: 15,
    subject: 'Science',
    icon: 'flask',
    color: '#4CAF50',
    bestScore: 90,
    timesPlayed: 4,
  },
  {
    id: '4',
    title: 'Memory Match',
    description: 'Match pairs of musical instruments',
    difficulty: 'Easy',
    rating: 5,
    points: 10,
    subject: 'Music',
    icon: 'music',
    color: '#E91E63',
    bestScore: 100,
    timesPlayed: 6,
  },
  {
    id: '5',
    title: 'Word Puzzle',
    description: 'Solve word puzzles and improve vocabulary',
    difficulty: 'Hard',
    rating: 4,
    points: 20,
    subject: 'Language',
    icon: 'book-alphabet',
    color: '#9C27B0',
    bestScore: 75,
    timesPlayed: 2,
  },
];

interface GameCardProps {
  game: Game;
  onPress: () => void;
}

const GameCard: React.FC<GameCardProps> = ({ game, onPress }) => {
  const [scaleAnim] = useState(new Animated.Value(1));

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
        style={styles.gameCard}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={[styles.gameImage, { backgroundColor: `${game.color}20` }]}>
          <MaterialCommunityIcons
            name={game.icon}
            size={48}
            color={game.color}
          />
          {game.bestScore && (
            <View style={styles.bestScore}>
              <MaterialCommunityIcons name="crown" size={16} color="#FFD700" />
              <Text style={styles.bestScoreText}>{game.bestScore}%</Text>
            </View>
          )}
        </View>
        <View style={styles.gameContent}>
          <View style={styles.gameHeader}>
            <Text style={styles.gameTitle}>{game.title}</Text>
            <View style={[
              styles.difficultyBadge,
              { 
                backgroundColor: 
                  game.difficulty === 'Easy' ? '#4CAF50' : 
                  game.difficulty === 'Medium' ? '#FF9800' : '#F44336'
              }
            ]}>
              <Text style={styles.difficultyText}>{game.difficulty}</Text>
            </View>
          </View>
          <Text style={styles.gameDescription}>{game.description}</Text>
          <View style={styles.gameFooter}>
            <View style={styles.ratingContainer}>
              {[...Array(5)].map((_, index) => (
                <MaterialCommunityIcons
                  key={index}
                  name={index < game.rating ? 'star' : 'star-outline'}
                  size={16}
                  color={index < game.rating ? '#FFD700' : '#C0C0C0'}
                />
              ))}
            </View>
            <View style={styles.pointsIndicator}>
              <MaterialCommunityIcons name="star" size={16} color="#FFD700" />
              <Text style={styles.pointsText}>+{game.points}</Text>
            </View>
          </View>
          <TouchableOpacity 
            style={[styles.playButton, { backgroundColor: game.color }]} 
            onPress={onPress}
          >
            <Text style={styles.playButtonText}>{game.isQuiz ? 'Start Quiz' : 'Play'}</Text>
            <Text style={styles.playCount}>
              {game.isQuiz 
                ? `${game.quizData?.questions?.length || 0} questions` 
                : `Played ${game.timesPlayed}x`}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Enhance the loading state with animations
const LoadingState = () => {
  const bounceAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);
  
  const translateY = bounceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  return (
    <View style={styles.loadingContainer}>
      <Animated.View style={{ transform: [{ translateY }] }}>
        <MaterialCommunityIcons name="gamepad-variant" size={48} color="#6A1B9A" />
      </Animated.View>
      <ActivityIndicator size="large" color="#6A1B9A" style={{ marginTop: 10 }} />
      <Text style={styles.loadingText}>Loading games and quizzes...</Text>
    </View>
  );
};

const GamesScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const { 
    quizzes, 
    loading, 
    error, 
    pointsEarned, 
    currentStreak, 
    bestStreak,
    quizResult
  } = useSelector((state: RootState) => state.quiz);

  
  // Fetch quizzes when component mounts
  useEffect(() => {
    dispatch(fetchQuizzes());
  }, [dispatch]);
  
  // Calculate stats
  const totalPoints = ACHIEVEMENTS.reduce((sum, achievement) => 
    sum + (achievement.isUnlocked ? achievement.points : 0), 0) + (pointsEarned || 0);
  const totalGamesPlayed = quizzes?.length || 0;

  // Handle game selection
  const handleGameSelect = (game: Game) => {
    if (game.isQuiz && game.quizData) {
      dispatch(selectQuiz(game.quizData));
      navigation.navigate('QuizGameScreen');
    } else {
      // Handle regular game navigation here
      Alert.alert('Coming Soon', 'This game will be available soon!');
    }
  };

  // Convert API quizzes to the format your UI expects
  const apiQuizGames = (quizzes || []).map(quiz => {
    // Map API difficulty to UI difficulty
    let difficulty: 'Easy' | 'Medium' | 'Hard';
    if (quiz.difficulty === 'beginner') difficulty = 'Easy';
    else if (quiz.difficulty === 'intermediate') difficulty = 'Medium';
    else difficulty = 'Hard';
    
    return {
      id: quiz._id || String(Math.random()),
      title: quiz.title,
      description: quiz.description || 'Test your knowledge with this quiz!',
      difficulty,
      rating: 4,
      points: 15,
      subject: quiz.topic || 'General',
      icon: 'help-circle',
      color: '#9C27B0',
      bestScore: null,
      timesPlayed: 0,
      isQuiz: true,
      quizData: quiz
    };
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Quizzes</Text>
          <View style={styles.pointsContainer}>
            <Text style={styles.pointsText}>{totalPoints} Points</Text>
            <MaterialCommunityIcons name="star" size={20} color="#FFD700" />
          </View>
        </View>

        {/* Display Quiz Results if available */}
        {quizResult && (
          <View style={styles.quizResultContainer}>
            <View style={styles.resultHeader}>
              <MaterialCommunityIcons name="trophy" size={24} color="#FFD700" />
              <Text style={styles.resultTitle}>Latest Quiz Result</Text>
            </View>
            <View style={styles.resultDetails}>
              <View style={styles.resultItem}>
                <Text style={styles.resultLabel}>Score:</Text>
                <Text style={styles.resultValue}>{quizResult.score}/{quizResult.maxScore}</Text>
              </View>
              <View style={styles.resultItem}>
                <Text style={styles.resultLabel}>Percentage:</Text>
                <Text style={styles.resultValue}>{quizResult.percentageScore}%</Text>
              </View>
              <View style={styles.resultItem}>
                <Text style={styles.resultLabel}>Points Earned:</Text>
                <Text style={styles.resultValue}>+{pointsEarned}</Text>
              </View>
              <View style={styles.resultItem}>
                <Text style={styles.resultLabel}>Current Streak:</Text>
                <Text style={styles.resultValue}>{currentStreak} days</Text>
              </View>
            </View>
          </View>
        )}

        <View style={styles.statsContainer}>
          <View style={[styles.statCard, styles.statCardShadow]}>
            <MaterialCommunityIcons name="gamepad-variant" size={24} color="#6A1B9A" />
            <Text style={styles.statValue}>{totalGamesPlayed}</Text>
            <Text style={styles.statLabel}>Quizzes Available</Text>
            <View style={styles.statDecoration}>
              <MaterialCommunityIcons name="gamepad-square-outline" size={12} color="#E1BEE7" />
            </View>
          </View>
          <View style={[styles.statCard, styles.statCardShadow]}>
            <MaterialCommunityIcons name="trophy" size={24} color="#6A1B9A" />
            <Text style={styles.statValue}>
              {pointsEarned || 0}
            </Text>
            <Text style={styles.statLabel}>Points Earned</Text>
            <View style={[styles.statDecoration, { right: 8 }]}>
              <MaterialCommunityIcons name="medal-outline" size={12} color="#E1BEE7" />
            </View>
          </View>
          <View style={[styles.statCard, styles.statCardShadow]}>
            <MaterialCommunityIcons name="fire" size={24} color="#6A1B9A" />
            <Text style={styles.statValue}>
              {currentStreak || 0}
            </Text>
            <Text style={styles.statLabel}>Day Streak</Text>
            <View style={[styles.statDecoration, { bottom: 8 }]}>
              <MaterialCommunityIcons name="star-outline" size={12} color="#E1BEE7" />
            </View>
          </View>
        </View>

        <View style={styles.gamesSection}>
          <Text style={styles.sectionTitle}>
            Available Quizzes
            <MaterialCommunityIcons name="gamepad-variant" size={24} color="#6A1B9A" style={{ marginLeft: 8 }} />
          </Text>
          
          {loading ? (
            <LoadingState />
          ) : error ? (
            <View style={styles.errorContainer}>
              <MaterialCommunityIcons name="alert-circle" size={40} color="#F44336" />
              <Text style={styles.errorText}>Failed to load quizzes: {error}</Text>
              <TouchableOpacity 
                style={styles.retryButton}
                onPress={() => dispatch(fetchQuizzes())}
              >
                <Text style={styles.retryButtonText}>Retry</Text>
                <MaterialCommunityIcons name="refresh" size={16} color="white" style={{ marginLeft: 4 }} />
              </TouchableOpacity>
            </View>
          ) : apiQuizGames.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="information-outline" size={48} color="#6A1B9A" />
              <Text style={styles.emptyText}>No quizzes available yet</Text>
            </View>
          ) : (
            apiQuizGames.map(game => (
              <GameCard 
                key={`quiz-${game.id}`} 
                game={game} 
                onPress={() => handleGameSelect(game)}
              />
            ))
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
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0E6FA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  pointsText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6A1B9A',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 12,
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
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  gamesSection: {
    padding: 16,
  },
  gameCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
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
  gameImage: {
    width: '100%',
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  bestScore: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  bestScoreText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  gameContent: {
    padding: 16,
  },
  gameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  gameTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 12,
    color: '#FFF',
    fontWeight: 'bold',
  },
  gameDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  gameFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  pointsIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF9C4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  playButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  playButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  playCount: {
    color: '#FFF',
    fontSize: 12,
    opacity: 0.8,
  },
  // Error and loading states
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    borderRadius: 12,
    marginBottom: 16,
  },
  errorText: {
    marginTop: 10,
    fontSize: 14,
    color: '#D32F2F',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#6A1B9A',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  quizResultContainer: {
    backgroundColor: '#FFF',
    margin: 16,
    marginTop: 0,
    marginBottom: 8,
    borderRadius: 12,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#6A1B9A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  resultDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  resultItem: {
    width: '48%',
    marginBottom: 8,
  },
  resultLabel: {
    fontSize: 12,
    color: '#666',
  },
  resultValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6A1B9A',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  decorElement: {
    position: 'absolute',
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 15,
    zIndex: 1,
  },
  sparkle: {
    position: 'absolute',
    top: -5,
    right: 10,
  },
  playButtonIcon: {
    marginLeft: 4,
  },
  statDecoration: {
    position: 'absolute',
    top: 8,
    left: 8,
    opacity: 0.5,
  },
  statCardShadow: {
    ...Platform.select({
      ios: {
        shadowColor: '#6A1B9A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default GamesScreen;