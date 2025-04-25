import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  StatusBar,
  Animated,
  Platform,
} from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { LessonsStackParamList } from '../types/navigation';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';

type SubjectScreenRouteProp = RouteProp<LessonsStackParamList, 'Subject'>;

const { width, height } = Dimensions.get('window');

// Fun color palette for kids
const KIDS_COLORS = {
  primary: '#FF6B6B',
  secondary: '#4ECDC4',
  accent1: '#FFD166',
  accent2: '#06D6A0',
  accent3: '#118AB2',
  background: '#F9F7F7',
  card: '#FFFFFF',
};

const DIFFICULTY_COLORS = {
  Beginner: '#4CAF50',
  Intermediate: '#FFC107',
  Advanced: '#F44336',
};

const SubjectScreen: React.FC = () => {
  const route = useRoute<SubjectScreenRouteProp>();
  const navigation = useNavigation();
  const { module } = route.params;
  
  // Animation values
  const scrollY = new Animated.Value(0);
  const bounceAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  
  // Start animations when component mounts
  useEffect(() => {
    // Bouncing animation for the character
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 1.1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
    
    // Rotating animation for achievements
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    ).start();
  }, []);
  
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
  
  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Mock lessons data with fun themes
  const mockLessons = [
    { id: '1', title: 'Adventure Begins!', duration: '10 min', completed: true, icon: 'rocket' },
    { id: '2', title: 'Magic of Learning', duration: '15 min', completed: false, icon: 'magic-staff' },
    { id: '3', title: 'Treasure Hunt', duration: '20 min', completed: false, icon: 'treasure-chest' },
    { id: '4', title: 'Super Powers', duration: '25 min', completed: false, icon: 'flash' },
    { id: '5', title: 'Final Challenge', duration: '15 min', completed: false, icon: 'trophy' },
  ];

  // Get vibrant color from module or use default
  const themeColor = module.color || KIDS_COLORS.primary;
  const secondaryColor = module.color ? lightenColor(module.color, 30) : KIDS_COLORS.accent1;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Animated Fun Header */}
      <Animated.View style={[
        styles.animatedHeader, 
        { opacity: headerOpacity }
      ]}>
        <LinearGradient
          colors={[themeColor, secondaryColor]}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
          style={styles.headerGradient}
        >
          <Text style={styles.headerTitle}>{module.name}</Text>
          <MaterialCommunityIcons name="star" size={24} color="#FFD700" />
        </LinearGradient>
      </Animated.View>
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {/* Fun Hero Section with Character */}
        <LinearGradient
          colors={[themeColor, secondaryColor]}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.heroSection}
        >
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>{module.name}</Text>
            <View style={styles.difficultyBadge}>
              <MaterialCommunityIcons name="star" size={16} color="#FFD700" />
              <Text style={styles.difficultyText}>{module.difficulty}</Text>
            </View>
          </View>
          
          <Animated.View style={[
            styles.characterContainer,
            { transform: [{ scale: bounceAnim }] }
          ]}>
            {/* <Image 
              source={require('../assets/images/kid-character.png')} 
              style={styles.characterImage}
              defaultSource={require('../assets/images/kid-character.png')}
            /> */}
          </Animated.View>
        </LinearGradient>
        
        {/* Cloud-shaped progress card */}
        <View style={styles.cloudCard}>
          <View style={styles.cloudInner}>
            <Text style={styles.cardTitle}>Your Journey</Text>
            <View style={styles.progressContainer}>
              <View style={styles.stars}>
                {mockLessons.map((_, index) => (
                  <MaterialCommunityIcons 
                    key={index}
                    name="star" 
                    size={24} 
                    color={index < 1 ? "#FFD700" : "#E0E0E0"} 
                    style={styles.star}
                  />
                ))}
              </View>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${(1/mockLessons.length) * 100}%`, backgroundColor: themeColor }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>1/{mockLessons.length} adventures completed!</Text>
            </View>
            
            <TouchableOpacity 
              style={[styles.continueButton, { backgroundColor: themeColor }]}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>Continue Adventure!</Text>
              <MaterialCommunityIcons name="rocket-launch" size={20} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Fun Facts Card */}
        <View style={styles.funFactCard}>
          <Text style={styles.funFactTitle}>Did you know?</Text>
          <Text style={styles.funFactText}>{module.description}</Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="clock-outline" size={24} color={themeColor} />
              <Text style={styles.statText}>1.5 hours of fun!</Text>
            </View>
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="star-circle" size={24} color={KIDS_COLORS.accent1} />
              <Text style={styles.statText}>{mockLessons.length} adventures</Text>
            </View>
          </View>
        </View>
        
        {/* Animated Achievement Badge */}
        <Animated.View style={[
          styles.achievementBadge,
          { transform: [{ rotate: spin }] }
        ]}>
          <MaterialCommunityIcons name="seal" size={70} color={themeColor} />
          <Text style={styles.achievementText}>Level 1</Text>
        </Animated.View>
        
        {/* Adventures List (Lessons) */}
        <View style={styles.adventuresCard}>
          <Text style={styles.cardTitle}>Your Adventures</Text>
          
          {mockLessons.map((lesson, index) => (
            <TouchableOpacity 
              key={lesson.id} 
              style={[
                styles.adventureItem,
                index === mockLessons.length - 1 && { borderBottomWidth: 0 }
              ]}
              activeOpacity={0.7}
            >
              <View style={[
                styles.adventureStatus, 
                { backgroundColor: lesson.completed ? KIDS_COLORS.accent2 : '#E0E0E0' }
              ]}>
                <MaterialCommunityIcons 
                  name={lesson.completed ? "check" : lesson.icon} 
                  size={20} 
                  color="#FFF" 
                />
              </View>
              
              <View style={styles.adventureContent}>
                <Text style={styles.adventureTitle}>{lesson.title}</Text>
                <Text style={styles.adventureDuration}>{lesson.duration}</Text>
              </View>
              
              <View style={[styles.playButton, { backgroundColor: lesson.completed ? '#E0E0E0' : themeColor }]}>
                <MaterialCommunityIcons 
                  name={lesson.completed ? "check-circle" : "play"} 
                  size={28} 
                  color="#FFF" 
                />
              </View>
            </TouchableOpacity>
          ))}
        </View>
        
        {/* Treasure Chest (Resources) */}
        <View style={styles.treasureCard}>
          <View style={styles.treasureHeader}>
            <MaterialCommunityIcons name="treasure-chest" size={32} color="#CD7F32" />
            <Text style={styles.cardTitle}>Treasure Chest</Text>
          </View>
          
          <TouchableOpacity style={styles.treasureItem}>
            <MaterialCommunityIcons name="book-open-variant" size={24} color={KIDS_COLORS.accent3} />
            <Text style={styles.treasureText}>Magic Storybook</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.treasureItem}>
            <MaterialCommunityIcons name="puzzle" size={24} color={KIDS_COLORS.accent1} />
            <Text style={styles.treasureText}>Fun Puzzles</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.treasureButton, { borderColor: themeColor }]}
          >
            <Text style={[styles.treasureButtonText, { color: themeColor }]}>
              Open Treasure Chest
            </Text>
            <MaterialCommunityIcons name="key" size={16} color={themeColor} />
          </TouchableOpacity>
        </View>
        
        {/* Bottom Space */}
        <View style={styles.bottomSpace} />
      </ScrollView>
    </SafeAreaView>
  );
};

// Helper function to lighten a color
function lightenColor(color: string, percent: number) {
  const num = parseInt(color.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  
  return '#' + (
    0x1000000 +
    (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
    (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
    (B < 255 ? (B < 1 ? 0 : B) : 255)
  ).toString(16).slice(1);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: KIDS_COLORS.background,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  animatedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    zIndex: 1000,
    paddingTop: Platform.OS === 'ios' ? 0 : StatusBar.currentHeight,
  },
  headerGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginRight: 10,
  },
  heroSection: {
    paddingTop: Platform.OS === 'ios' ? 80 : StatusBar.currentHeight ? StatusBar.currentHeight + 80 : 80,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroContent: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  difficultyBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
  },
  difficultyText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 5,
  },
  characterContainer: {
    width: 130,
    height: 130,
    justifyContent: 'center',
    alignItems: 'center',
  },
  characterImage: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
  },
  cloudCard: {
    marginHorizontal: 16,
    marginTop: -20,
    backgroundColor: 'transparent',
  },
  cloudInner: {
    backgroundColor: KIDS_COLORS.card,
    borderRadius: 25,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  stars: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  star: {
    marginHorizontal: 5,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressBar: {
    height: 10,
    backgroundColor: '#F0F0F0',
    borderRadius: 5,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderRadius: 25,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
    marginRight: 8,
  },
  funFactCard: {
    backgroundColor: KIDS_COLORS.card,
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 16,
    marginTop: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  funFactTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: KIDS_COLORS.primary,
    marginBottom: 10,
  },
  funFactText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#555',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  achievementBadge: {
    alignSelf: 'center',
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  achievementText: {
    position: 'absolute',
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFF',
  },
  adventuresCard: {
    backgroundColor: KIDS_COLORS.card,
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 16,
    marginTop: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  adventureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  adventureStatus: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  adventureContent: {
    flex: 1,
    marginLeft: 16,
  },
  adventureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  adventureDuration: {
    fontSize: 14,
    color: '#888',
  },
  playButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  treasureCard: {
    backgroundColor: KIDS_COLORS.card,
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 16,
    marginTop: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  treasureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  treasureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 241, 118, 0.1)',
    marginBottom: 10,
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  treasureText: {
    marginLeft: 16,
    fontSize: 15,
    color: '#444',
    fontWeight: '500',
  },
  treasureButton: {
    borderWidth: 2,
    borderRadius: 25,
    paddingVertical: 12,
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  treasureButtonText: {
    fontWeight: '600',
    fontSize: 14,
    marginRight: 8,
  },
  bottomSpace: {
    height: 20,
  },
});

export default SubjectScreen; 