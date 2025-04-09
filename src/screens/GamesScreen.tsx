import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

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

const AchievementIcon: React.FC<{ achievement: Achievement }> = ({ achievement }) => (
  <TouchableOpacity style={styles.achievementContainer}>
    <View style={[styles.achievementIcon, { backgroundColor: achievement.isUnlocked ? '#F0E6FA' : '#F5F5F5' }]}>
      <MaterialCommunityIcons
        name={achievement.icon}
        size={32}
        color={achievement.isUnlocked ? achievement.color : '#A0A0A0'}
      />
      <View style={styles.achievementPoints}>
        <Text style={styles.achievementPointsText}>+{achievement.points}</Text>
      </View>
    </View>
    <Text style={[
      styles.achievementTitle,
      { color: achievement.isUnlocked ? '#333' : '#A0A0A0' }
    ]}>
      {achievement.title}
    </Text>
    <View style={styles.achievementProgress}>
      <View 
        style={[
          styles.achievementProgressBar, 
          { 
            width: `${(achievement.progress / achievement.requirement) * 100}%`,
            backgroundColor: achievement.isUnlocked ? achievement.color : '#A0A0A0'
          }
        ]} 
      />
    </View>
  </TouchableOpacity>
);

const GameCard: React.FC<{ game: Game }> = ({ game }) => {
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
          <TouchableOpacity style={[styles.playButton, { backgroundColor: game.color }]}>
            <Text style={styles.playButtonText}>Play</Text>
            <Text style={styles.playCount}>Played {game.timesPlayed}x</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const GamesScreen: React.FC = () => {
  const totalPoints = ACHIEVEMENTS.reduce((sum, achievement) => 
    sum + (achievement.isUnlocked ? achievement.points : 0), 0);
  const totalGamesPlayed = GAMES.reduce((sum, game) => sum + game.timesPlayed, 0);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.title}>Fun & Games</Text>
          <View style={styles.pointsContainer}>
            <Text style={styles.pointsText}>{totalPoints} Points</Text>
            <MaterialCommunityIcons name="star" size={20} color="#FFD700" />
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="gamepad-variant" size={24} color="#6A1B9A" />
            <Text style={styles.statValue}>{totalGamesPlayed}</Text>
            <Text style={styles.statLabel}>Games Played</Text>
          </View>
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="trophy" size={24} color="#6A1B9A" />
            <Text style={styles.statValue}>
              {ACHIEVEMENTS.filter(a => a.isUnlocked).length}/{ACHIEVEMENTS.length}
            </Text>
            <Text style={styles.statLabel}>Achievements</Text>
          </View>
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="star" size={24} color="#6A1B9A" />
            <Text style={styles.statValue}>
              {Math.round(GAMES.reduce((sum, game) => sum + (game.bestScore || 0), 0) / GAMES.length)}%
            </Text>
            <Text style={styles.statLabel}>Avg. Score</Text>
          </View>
        </View>

        <View style={styles.achievementsSection}>
          <Text style={styles.sectionTitle}>My Achievements</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.achievementsContainer}>
            {ACHIEVEMENTS.map(achievement => (
              <AchievementIcon key={achievement.id} achievement={achievement} />
            ))}
          </ScrollView>
        </View>

        <View style={styles.gamesSection}>
          <Text style={styles.sectionTitle}>Available Games</Text>
          {GAMES.map(game => (
            <GameCard key={game.id} game={game} />
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
  achievementsSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  achievementsContainer: {
    flexDirection: 'row',
    gap: 16,
    paddingRight: 16,
  },
  achievementContainer: {
    alignItems: 'center',
    gap: 8,
    width: 80,
  },
  achievementIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0E6FA',
  },
  achievementPoints: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#6A1B9A',
    borderRadius: 10,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  achievementPointsText: {
    fontSize: 10,
    color: '#FFF',
    fontWeight: 'bold',
  },
  achievementTitle: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
  },
  achievementProgress: {
    width: '100%',
    height: 3,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  achievementProgressBar: {
    height: '100%',
    borderRadius: 2,
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
});

export default GamesScreen; 