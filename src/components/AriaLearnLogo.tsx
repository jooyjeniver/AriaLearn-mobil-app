import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const AriaLearnLogo = ({ size = 100 }) => {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <View style={styles.logoCircle}>
        <MaterialCommunityIcons 
          name="brain" 
          size={size * 0.5} 
          color="#fff" 
        />
      </View>
      <Text style={styles.logoText}>
        <Text style={styles.highlight}>Aria</Text>
        <Text>Learn</Text>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoCircle: {
    width: '80%',
    height: '80%',
    borderRadius: 999,
    backgroundColor: '#7c4dff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  logoText: {
    marginTop: 5,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  highlight: {
    color: '#7c4dff',
  },
});

export default AriaLearnLogo; 