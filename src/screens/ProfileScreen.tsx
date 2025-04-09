import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Switch,
  Alert,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const ProfileScreen = ({ navigation }: any) => {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  // Mock user data - replace with actual user data from your auth system
  const user = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    joinDate: 'January 2024',
    progress: {
      completedLessons: 24,
      totalHours: 12.5,
      achievements: 8,
    },
  };

  const menuItems = [
    {
      icon: 'account-edit-outline',
      title: 'Edit Profile',
      onPress: () => Alert.alert('Edit Profile', 'Coming soon!'),
    },
    {
      icon: 'bell-outline',
      title: 'Notifications',
      isSwitch: true,
      value: notifications,
      onValueChange: setNotifications,
    },
    {
      icon: 'theme-light-dark',
      title: 'Dark Mode',
      isSwitch: true,
      value: darkMode,
      onValueChange: setDarkMode,
    },
    {
      icon: 'help-circle-outline',
      title: 'Help & Support',
      onPress: () => Alert.alert('Help & Support', 'Coming soon!'),
    },
    {
      icon: 'shield-check-outline',
      title: 'Privacy Policy',
      onPress: () => Alert.alert('Privacy Policy', 'Coming soon!'),
    },
    {
      icon: 'logout',
      title: 'Logout',
      onPress: () => Alert.alert('Logout', 'Are you sure you want to logout?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: () => console.log('Logout pressed') },
      ]),
    },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.profileImageContainer}>
          <Image
            source={{ uri: 'https://via.placeholder.com/150' }}
            style={styles.profileImage}
          />
          <TouchableOpacity style={styles.editImageButton}>
            <MaterialCommunityIcons name="camera" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.email}>{user.email}</Text>
        <Text style={styles.joinDate}>Member since {user.joinDate}</Text>
      </View>

      {/* Progress Section */}
      <View style={styles.progressContainer}>
        <View style={styles.progressItem}>
          <Text style={styles.progressNumber}>{user.progress.completedLessons}</Text>
          <Text style={styles.progressLabel}>Lessons</Text>
        </View>
        <View style={styles.progressItem}>
          <Text style={styles.progressNumber}>{user.progress.totalHours}</Text>
          <Text style={styles.progressLabel}>Hours</Text>
        </View>
        <View style={styles.progressItem}>
          <Text style={styles.progressNumber}>{user.progress.achievements}</Text>
          <Text style={styles.progressLabel}>Achievements</Text>
        </View>
      </View>

      {/* Menu Items */}
      <View style={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={item.onPress}
            disabled={item.isSwitch}>
            <View style={styles.menuItemLeft}>
              <MaterialCommunityIcons name={item.icon} size={24} color="#6A1B9A" />
              <Text style={styles.menuItemText}>{item.title}</Text>
            </View>
            {item.isSwitch ? (
              <Switch
                value={item.value}
                onValueChange={item.onValueChange}
                trackColor={{ false: '#ddd', true: '#b794d4' }}
                thumbColor={item.value ? '#6A1B9A' : '#f4f3f4'}
              />
            ) : (
              <MaterialCommunityIcons name="chevron-right" size={24} color="#666" />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  editImageButton: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: '#6A1B9A',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  email: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  joinDate: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
  progressContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 10,
    justifyContent: 'space-around',
  },
  progressItem: {
    alignItems: 'center',
  },
  progressNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6A1B9A',
  },
  progressLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  menuContainer: {
    backgroundColor: '#fff',
    marginTop: 10,
    paddingHorizontal: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 15,
  },
});

export default ProfileScreen; 