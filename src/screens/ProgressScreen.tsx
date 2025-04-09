import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const ProgressScreen = () => {
  const subjects = [
    { name: 'Math', progress: 75, color: '#4287f5' },
    { name: 'Science', progress: 60, color: '#2ecc71' },
    { name: 'Reading', progress: 90, color: '#9b59b6' },
    { name: 'Social Studies', progress: 45, color: '#f1c40f' },
  ];

  const weeklyData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      data: [2, 1.5, 0.5, 1, 0.75, 0.25, 0.5],
    }],
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header with Profile */}
      <View style={styles.header}>
        <Text style={styles.title}>Progress Dashboard</Text>
        <MaterialCommunityIcons 
          name="account-circle" 
          size={40} 
          color="#6A1B9A" 
          style={styles.profileIcon}
        />
      </View>

      {/* Subject Progress Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Subject Progress</Text>
        {subjects.map((subject, index) => (
          <View key={index} style={styles.progressItem}>
            <Text style={styles.subjectName}>{subject.name}</Text>
            <View style={styles.progressBarContainer}>
              <View 
                style={[
                  styles.progressBar, 
                  { width: `${subject.progress}%`, backgroundColor: subject.color }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>{subject.progress}%</Text>
          </View>
        ))}
      </View>

      {/* Weekly Activity Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Weekly Activity</Text>
        <LineChart
          data={weeklyData}
          width={350}
          height={200}
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 1,
            color: (opacity = 1) => `rgba(106, 27, 154, ${opacity})`,
            style: {
              borderRadius: 16,
            },
          }}
          bezier
          style={styles.chart}
        />
        <Text style={styles.totalHours}>Total: 6.5 hours this week</Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6A1B9A',
  },
  profileIcon: {
    marginLeft: 10,
  },
  section: {
    backgroundColor: '#fff',
    margin: 10,
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  progressItem: {
    marginBottom: 15,
  },
  subjectName: {
    fontSize: 16,
    marginBottom: 5,
    color: '#444',
  },
  progressBarContainer: {
    height: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 5,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
    textAlign: 'right',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  totalHours: {
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
    marginTop: 5,
  },
});

export default ProgressScreen; 