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
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logout, updateUserDetails, getCurrentUser } from '../store/slices/authSlice';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { SubjectStackParamList } from '../types/navigation';
import { useToast } from '../components/ToastManager';

type UserProfileScreenNavigationProp = NativeStackNavigationProp<SubjectStackParamList, 'UserProfile'>;

const UserProfileScreen = () => {
  const dispatch = useAppDispatch();
  const { user, loading } = useAppSelector((state) => state.auth);
  const navigation = useNavigation<UserProfileScreenNavigationProp>();
  const { showToast } = useToast();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Update local state when user data changes
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  // Load user data on component mount
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      await dispatch(getCurrentUser()).unwrap();
    } catch (error) {
      showToast('Failed to load user data', 'error');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadUserData();
    } finally {
      setRefreshing(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(logout()).unwrap();
              showToast('Logged out successfully', 'success');
            } catch (error) {
              showToast('Failed to logout. Please try again.', 'error');
            }
          },
        },
      ]
    );
  };

  const handleUpdateProfile = async () => {
    if (!name || !email) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    try {
      await dispatch(updateUserDetails({ name, email })).unwrap();
      showToast('Profile updated successfully', 'success');
      setIsEditing(false);
    } catch (error: any) {
      showToast(error.message || 'Failed to update profile', 'error');
    }
  };

  if (loading && !user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6A1B9A" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>No user data available</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadUserData}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['#6A1B9A']}
          tintColor="#6A1B9A"
        />
      }
    >
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Image
            source={{ uri: user.avatar || 'https://via.placeholder.com/100' }}
            style={styles.avatar}
          />
          <TouchableOpacity style={styles.editAvatarButton}>
            <MaterialCommunityIcons name="camera" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
        
        {isEditing ? (
          <View style={styles.editForm}>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Your name"
              placeholderTextColor="#ccc"
            />
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Your email"
              placeholderTextColor="#ccc"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <View style={styles.editButtons}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={() => {
                  setIsEditing(false);
                  setName(user.name || '');
                  setEmail(user.email || '');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.saveButton} 
                onPress={handleUpdateProfile}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.saveButtonText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.userInfo}>
            <Text style={styles.name}>{user.name || 'No name set'}</Text>
            <Text style={styles.email}>{user.email || 'No email set'}</Text>
            <TouchableOpacity 
              style={styles.editProfileButton}
              onPress={() => setIsEditing(true)}
            >
              <MaterialCommunityIcons name="pencil" size={16} color="#fff" />
              <Text style={styles.editProfileText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* User Details Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Information</Text>
        <View style={styles.detailItem}>
          <MaterialCommunityIcons name="account" size={24} color="#666" />
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Name</Text>
            <Text style={styles.detailValue}>{user.name || 'Not set'}</Text>
          </View>
        </View>
        <View style={styles.detailItem}>
          <MaterialCommunityIcons name="email" size={24} color="#666" />
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Email</Text>
            <Text style={styles.detailValue}>{user.email || 'Not set'}</Text>
          </View>
        </View>
      </View>

      {/* Progress Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Progress</Text>
        <View style={styles.progressGrid}>
          <View style={styles.progressItem}>
            <Text style={styles.progressNumber}>{user.progress?.completedLessons || 0}</Text>
            <Text style={styles.progressLabel}>Lessons Completed</Text>
          </View>
          <View style={styles.progressItem}>
            <Text style={styles.progressNumber}>{user.progress?.totalHours || 0}h</Text>
            <Text style={styles.progressLabel}>Learning Time</Text>
          </View>
          <View style={styles.progressItem}>
            <Text style={styles.progressNumber}>{user.progress?.achievements || 0}</Text>
            <Text style={styles.progressLabel}>Achievements</Text>
          </View>
        </View>
      </View>

      {/* Settings Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>
        
        {/* Notifications */}
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <MaterialCommunityIcons name="bell-outline" size={24} color="#666" />
            <Text style={styles.settingText}>Notifications</Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: '#767577', true: '#6A1B9A' }}
            thumbColor={notificationsEnabled ? '#fff' : '#f4f3f4'}
          />
        </View>

        {/* Dark Mode */}
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <MaterialCommunityIcons name="theme-light-dark" size={24} color="#666" />
            <Text style={styles.settingText}>Dark Mode</Text>
          </View>
          <Switch
            value={darkMode}
            onValueChange={setDarkMode}
            trackColor={{ false: '#767577', true: '#6A1B9A' }}
            thumbColor={darkMode ? '#fff' : '#f4f3f4'}
          />
        </View>

        {/* Language */}
        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <MaterialCommunityIcons name="translate" size={24} color="#666" />
            <Text style={styles.settingText}>Language</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#666" />
        </TouchableOpacity>

        {/* Privacy */}
        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <MaterialCommunityIcons name="shield-lock-outline" size={24} color="#666" />
            <Text style={styles.settingText}>Privacy Settings</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <MaterialCommunityIcons name="logout" size={24} color="#ff3b30" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#9C27B0',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  header: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#6A1B9A',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#fff',
  },
  editAvatarButton: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: '#6A1B9A',
    borderRadius: 15,
    padding: 8,
    borderWidth: 2,
    borderColor: '#fff',
  },
  userInfo: {
    alignItems: 'center',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.8,
    marginBottom: 10,
  },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  editProfileText: {
    color: '#fff',
    marginLeft: 5,
    fontSize: 14,
  },
  editForm: {
    width: '100%',
    marginTop: 10,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    marginBottom: 10,
    fontSize: 16,
  },
  editButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 12,
    borderRadius: 8,
    marginRight: 5,
    alignItems: 'center',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginLeft: 5,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonText: {
    color: '#6A1B9A',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  detailContent: {
    marginLeft: 15,
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
  },
  progressGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressItem: {
    alignItems: 'center',
    flex: 1,
  },
  progressNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6A1B9A',
    marginBottom: 5,
  },
  progressLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 15,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    marginTop: 20,
    marginBottom: 40,
  },
  logoutText: {
    fontSize: 16,
    color: '#ff3b30',
    marginLeft: 10,
    fontWeight: '600',
  },
});

export default UserProfileScreen; 