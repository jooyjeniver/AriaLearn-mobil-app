import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
  Alert,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  ImageBackground,
  Animated,
  Easing,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logout, updateUserDetails, getCurrentUser } from '../store/slices/authSlice';
import type { User } from '../types/auth';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../types/navigation';
import { useToast } from '../context/ToastContext';

type UserProfileScreenNavigationProp = NativeStackNavigationProp<MainStackParamList, 'Profile'>;

interface Props {
  navigation: UserProfileScreenNavigationProp;
}

// Fun badge component for kids
const AchievementBadge = ({ icon, count, label, color }: { icon: string, count: number, label: string, color: string }) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  
  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.2,
        duration: 200,
        useNativeDriver: true,
        easing: Easing.bounce
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true
      })
    ]).start();
  };
  
  return (
    <TouchableOpacity onPress={handlePress}>
      <Animated.View style={[styles.badgeContainer, { backgroundColor: color, transform: [{ scale: scaleAnim }] }]}>
        <MaterialCommunityIcons name={icon} size={28} color="#FFF" />
        <Text style={styles.badgeCount}>{count}</Text>
        <Text style={styles.badgeLabel}>{label}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

const UserProfileScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { user, loading } = useAppSelector((state) => state.auth);
  const [refreshing, setRefreshing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const { showToast } = useToast();
  
  // Animation values
  const spinValue = React.useRef(new Animated.Value(0)).current;
  const bounceValue = React.useRef(new Animated.Value(0)).current;

  // Kid-friendly avatar options with fun characters
  const avatarOptions = [
    'https://cdn-icons-png.flaticon.com/512/4140/4140048.png', // dinosaur
    'https://cdn-icons-png.flaticon.com/512/4140/4140047.png', // space
    'https://cdn-icons-png.flaticon.com/512/4140/4140051.png', // robot
    'https://cdn-icons-png.flaticon.com/512/4140/4140037.png', // superhero
    'https://cdn-icons-png.flaticon.com/512/2922/2922688.png', // astronaut
    'https://cdn-icons-png.flaticon.com/512/4139/4139993.png', // wizard
    'https://cdn-icons-png.flaticon.com/512/4139/4139996.png', // pirate
    'https://cdn-icons-png.flaticon.com/512/4140/4140054.png', // knight
  ];
  
  const [selectedAvatar, setSelectedAvatar] = useState(avatarOptions[0]);
  const [showAvatarOptions, setShowAvatarOptions] = useState(false);

  // Start animations
  useEffect(() => {
    // Spinning animation for loading
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true
      })
    ).start();
    
    // Bounce animation for elements
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true
        }),
        Animated.timing(bounceValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true
        })
      ])
    ).start();
  }, []);

  // Interpolate for spin animation
  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });
  
  // Interpolate for bounce animation
  const bounce = bounceValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10]
  });

  useEffect(() => {
    if (user?.name) {
      setEditedName(user.name);
    }
    // Use user avatar if available, otherwise use default
    if (user?.avatar) {
      setSelectedAvatar(user.avatar);
    }
  }, [user?.name, user?.avatar]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await dispatch(getCurrentUser());
      showToast('Profile refreshed! 🔄', 'success');
    } catch (error) {
      showToast('Failed to refresh profile', 'error');
    } finally {
      setRefreshing(false);
    }
  };

  const handleUpdateProfile = async (name: string) => {
    try {
      // Cast the object to any to avoid TypeScript errors
      // This is necessary because the type definition might not be updated
      const userData = {
        name,
        email: user?.email || '',
        avatar: selectedAvatar
      } as any;
      
      await dispatch(updateUserDetails(userData)).unwrap();
      setIsEditing(false);
      showToast('Profile updated successfully! 🎉', 'success');
    } catch (error) {
      showToast('Failed to update profile', 'error');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'End Adventure?',
      'Are you sure you want to leave your adventure?',
      [
        { text: 'Stay and Play', style: 'cancel' },
        {
          text: 'Exit Adventure',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(logout());
              showToast('See you later, explorer! 👋', 'success');
            } catch (error) {
              showToast('Failed to logout', 'error');
            }
          },
        },
      ],
    );
  };

  const handleNotificationToggle = (value: boolean) => {
    setNotifications(value);
    showToast(
      value ? 'Adventure alerts ON! 🔔' : 'Adventure alerts OFF 🔕',
      'info'
    );
  };

  const handleDarkModeToggle = (value: boolean) => {
    setDarkMode(value);
    showToast(
      value ? 'Night mode activated! 🌙' : 'Day mode activated! ☀️',
      'info'
    );
  };

  if (loading && !user) {
    return (
      <View style={styles.loadingContainer}>
        <Animated.View style={{ transform: [{ rotate: spin }] }}>
          <MaterialCommunityIcons name="rocket" size={60} color="#FFD700" />
        </Animated.View>
        <Text style={styles.loadingText}>Preparing your adventure profile...</Text>
        <Text style={styles.loadingSubText}>Get ready to explore!</Text>
      </View>
    );
  }

  // Fun background images for kids
  const backgroundImages = [
    'https://img.freepik.com/free-vector/space-background-with-stars-vector-illustration_97886-319.jpg',
    'https://img.freepik.com/free-vector/hand-painted-watercolor-pastel-sky-background_23-2148902771.jpg',
    'https://img.freepik.com/free-vector/gradient-dynamic-blue-lines-background_23-2148995756.jpg'
  ];

  return (
    <ImageBackground 
      source={{uri: darkMode ? backgroundImages[0] : backgroundImages[1]}}
      style={styles.backgroundImage}
    >
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }>
        
        {/* Floating stars/elements for fun */}
        <Animated.View style={[styles.floatingElement, { top: 20, right: 20, transform: [{ translateY: bounce }] }]}>
          <MaterialCommunityIcons name="star" size={24} color="#FFD700" />
        </Animated.View>
        <Animated.View style={[styles.floatingElement, { top: 60, left: 30, transform: [{ translateY: Animated.multiply(bounce, -1) }] }]}>
          <MaterialCommunityIcons name="rocket" size={20} color="#FF6B6B" />
        </Animated.View>
        
        {/* Profile Header with animated elements */}
        <View style={styles.header}>
          <View style={styles.profileCard}>
            <View style={styles.profileImageContainer}>
              <Image
                source={{ uri: selectedAvatar }}
                style={styles.profileImage}
              />
              <TouchableOpacity
                style={styles.editImageButton}
                onPress={() => setShowAvatarOptions(!showAvatarOptions)}>
                <MaterialCommunityIcons name="robot" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
            
            {/* Avatar selection - now with animation */}
            {showAvatarOptions && (
              <Animated.View 
                style={[
                  styles.avatarOptions,
                  { opacity: spinValue } // Fade in animation
                ]}
              >
                {avatarOptions.map((avatar, index) => (
                  <TouchableOpacity 
                    key={index}
                    style={[
                      styles.avatarOption,
                      selectedAvatar === avatar && styles.selectedAvatarOption
                    ]}
                    onPress={() => {
                      setSelectedAvatar(avatar);
                      setShowAvatarOptions(false);
                    }}
                  >
                    <Image source={{ uri: avatar }} style={styles.avatarOptionImage} />
                  </TouchableOpacity>
                ))}
              </Animated.View>
            )}
            
            {isEditing ? (
              <View style={styles.editNameContainer}>
                <TextInput
                  style={styles.nameInput}
                  value={editedName}
                  onChangeText={setEditedName}
                  placeholder="What's your explorer name?"
                  placeholderTextColor="#777"
                  maxLength={20}
                />
                <View style={styles.editButtons}>
                  <TouchableOpacity
                    style={[styles.editButton, styles.cancelButton]}
                    onPress={() => {
                      setIsEditing(false);
                      setEditedName(user?.name || '');
                    }}>
                    <Text style={styles.editButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.editButton, styles.saveButton]}
                    onPress={() => handleUpdateProfile(editedName)}>
                    <Text style={styles.editButtonText}>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.nameContainer}>
                <Text style={styles.name}>{user?.name || 'Explorer'}</Text>
                <TouchableOpacity
                  style={styles.editNameButton}
                  onPress={() => setIsEditing(true)}>
                  <MaterialCommunityIcons name="pencil" size={24} color="#FFD700" />
                </TouchableOpacity>
              </View>
            )}
            <Text style={styles.email}>{user?.email || 'Not set'}</Text>
            
            {/* Level indicator */}
            <View style={styles.levelContainer}>
              <Text style={styles.levelText}>Level {Math.floor(Math.random() * 10) + 1}</Text>
              <View style={styles.levelBar}>
                <View style={[styles.levelProgress, { width: `${Math.floor(Math.random() * 100)}%` }]} />
              </View>
            </View>
          </View>
        </View>

        {/* Achievements Section with badges */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Adventure Badges</Text>
          <View style={styles.badgesGrid}>
            <AchievementBadge 
              icon="book-open-variant" 
              count={user?.progress?.completedLessons || 0} 
              label="Lessons" 
              color="#FF6B6B" 
            />
            <AchievementBadge 
              icon="clock-outline" 
              count={user?.progress?.totalHours || 0} 
              label="Hours" 
              color="#4ECDC4" 
            />
            <AchievementBadge 
              icon="star" 
              count={user?.progress?.achievements || 0} 
              label="Stars" 
              color="#FFD700" 
            />
            <AchievementBadge 
              icon="trophy" 
              count={Math.floor(Math.random() * 5)} 
              label="Trophies" 
              color="#9C89B8" 
            />
          </View>
        </View>

        {/* Fun Stats Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Adventure Stats</Text>
          <View style={styles.funStatsContainer}>
            <View style={styles.funStat}>
              <MaterialCommunityIcons name="brain" size={32} color="#FF9F1C" />
              <Text style={styles.funStatValue}>{Math.floor(Math.random() * 1000) + 100}</Text>
              <Text style={styles.funStatLabel}>Brain Points</Text>
            </View>
            <View style={styles.funStat}>
              <MaterialCommunityIcons name="lightbulb-on" size={32} color="#F06292" />
              <Text style={styles.funStatValue}>{Math.floor(Math.random() * 50) + 5}</Text>
              <Text style={styles.funStatLabel}>Ideas Found</Text>
            </View>
            <View style={styles.funStat}>
              <MaterialCommunityIcons name="puzzle" size={32} color="#64B5F6" />
              <Text style={styles.funStatValue}>{Math.floor(Math.random() * 20) + 1}</Text>
              <Text style={styles.funStatLabel}>Puzzles Solved</Text>
            </View>
          </View>
        </View>

        {/* Settings Section with fun icons */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mission Control</Text>
          <View style={styles.settingItem}>
            <MaterialCommunityIcons name="bell-outline" size={28} color="#FF9F1C" />
            <Text style={styles.settingLabel}>Adventure Alerts</Text>
            <Switch
              value={notifications}
              onValueChange={handleNotificationToggle}
              trackColor={{ false: '#767577', true: '#8BC34A' }}
              thumbColor={notifications ? '#fff' : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
            />
          </View>
          <View style={styles.settingItem}>
            <MaterialCommunityIcons name="weather-night" size={28} color="#9C89B8" />
            <Text style={styles.settingLabel}>Space Mode</Text>
            <Switch
              value={darkMode}
              onValueChange={handleDarkModeToggle}
              trackColor={{ false: '#767577', true: '#8BC34A' }}
              thumbColor={darkMode ? '#fff' : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
            />
          </View>
          <View style={styles.settingItem}>
            <MaterialCommunityIcons name="volume-high" size={28} color="#4CAF50" />
            <Text style={styles.settingLabel}>Fun Sounds</Text>
            <Switch
              value={true}
              trackColor={{ false: '#767577', true: '#8BC34A' }}
              thumbColor={'#fff'}
              ios_backgroundColor="#3e3e3e"
            />
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <MaterialCommunityIcons name="rocket-launch" size={28} color="#fff" />
          <Text style={styles.logoutText}>End Adventure</Text>
        </TouchableOpacity>
        
        {/* Bottom padding */}
        <View style={{height: 40}} />
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
  },
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#6A1B9A',
  },
  loadingText: {
    marginTop: 20,
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  loadingSubText: {
    marginTop: 10,
    color: '#FFD700',
    fontSize: 16,
  },
  header: {
    alignItems: 'center',
    padding: 20,
    paddingTop: 30,
  },
  profileCard: {
    backgroundColor: 'rgba(106, 27, 154, 0.8)',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    width: '95%',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.34,
    shadowRadius: 6.27,
    elevation: 10,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#FFD700',
  },
  editImageButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FF9F1C',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  avatarOptions: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginBottom: 15,
    maxWidth: 280,
  },
  avatarOption: {
    margin: 5,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: 'transparent',
    padding: 2,
  },
  selectedAvatarOption: {
    borderColor: '#FFD700',
    backgroundColor: 'rgba(255, 215, 0, 0.3)',
  },
  avatarOptionImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginRight: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 10
  },
  editNameButton: {
    padding: 5,
    backgroundColor: 'rgba(255, 215, 0, 0.3)',
    borderRadius: 15,
    width: 35,
    height: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editNameContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  nameInput: {
    width: '90%',
    height: 45,
    borderWidth: 2,
    borderColor: '#FFD700',
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  editButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '90%',
  },
  editButton: {
    padding: 10,
    borderRadius: 12,
    marginHorizontal: 10,
    minWidth: 100,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cancelButton: {
    backgroundColor: '#FF6B6B',
  },
  saveButton: {
    backgroundColor: '#8BC34A',
  },
  editButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  email: {
    fontSize: 16,
    color: '#E0E0E0',
  },
  levelContainer: {
    width: '80%',
    marginTop: 15,
    alignItems: 'center',
  },
  levelText: {
    color: '#FFD700',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  levelBar: {
    width: '100%',
    height: 12,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 6,
    overflow: 'hidden',
  },
  levelProgress: {
    height: '100%',
    backgroundColor: '#FFD700',
  },
  section: {
    margin: 15,
    marginBottom: 10,
    borderRadius: 20,
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6A1B9A',
    marginBottom: 15,
    textAlign: 'center',
    letterSpacing: 1,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  badgeContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  badgeCount: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
    marginTop: 2,
  },
  badgeLabel: {
    color: 'white',
    fontSize: 10,
    fontWeight: '500',
  },
  funStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
  },
  funStat: {
    alignItems: 'center',
    padding: 10,
    minWidth: 90,
  },
  funStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6A1B9A',
    marginVertical: 5,
  },
  funStatLabel: {
    fontSize: 12,
    color: '#555',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  progressGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  progressItem: {
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 15,
    minWidth: 90,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  progressNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6A1B9A',
    marginVertical: 5,
  },
  progressLabel: {
    fontSize: 12,
    color: '#555',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    marginVertical: 5,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    paddingHorizontal: 15,
  },
  settingLabel: {
    flex: 1,
    fontSize: 18,
    color: '#333',
    marginLeft: 15,
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    margin: 20,
    backgroundColor: '#FF5252',
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.32,
    shadowRadius: 5.46,
    elevation: 9,
  },
  logoutText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  floatingElement: {
    position: 'absolute',
    zIndex: 10,
  },
});

export default UserProfileScreen; 