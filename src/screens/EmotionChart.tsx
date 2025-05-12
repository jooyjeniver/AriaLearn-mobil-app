import React, { useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView,
  useWindowDimensions
} from 'react-native';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { RootState } from '../store/store';
import { EmotionValues } from '../hooks/useEmotionAnalyzer';

// Map emotions to emoji and colors
const emotionConfig = {
  happiness: { icon: 'emoticon-happy-outline', color: '#4CAF50', label: 'Happy' },
  neutral: { icon: 'emoticon-neutral-outline', color: '#9E9E9E', label: 'Neutral' },
  surprise: { icon: 'emoticon-surprised-outline', color: '#2196F3', label: 'Surprised' },
  sadness: { icon: 'emoticon-sad-outline', color: '#607D8B', label: 'Sad' },
  anger: { icon: 'emoticon-angry-outline', color: '#F44336', label: 'Angry' },
  disgust: { icon: 'emoticon-sick-outline', color: '#795548', label: 'Disgusted' },
  fear: { icon: 'emoticon-scared-outline', color: '#9C27B0', label: 'Fearful' },
};

type EmotionKey = keyof typeof emotionConfig;

const EmotionChart: React.FC = () => {
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const { emotionData, isMockData } = useSelector((state: RootState) => state.emotion);
  
  // Helper to get the first detected face or return null
  const getFirstFace = useCallback(() => {
    if (!emotionData || emotionData.totalFaces === 0 || emotionData.faces.length === 0) {
      return null;
    }
    return emotionData.faces[0];
  }, [emotionData]);

  // If no emotion data, navigate back
  if (!emotionData) {
    navigation.goBack();
    return null;
  }

  const firstFace = getFirstFace();
  if (!firstFace) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons name="face-recognition" size={60} color="#F44336" />
          <Text style={styles.errorText}>No faces detected in the image.</Text>
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Prepare data for victory charts
  const emotions = firstFace.emotions;
  
  // Format data for Victory Bar Chart
  const barData = Object.keys(emotions).map(key => {
    const emotionKey = key as EmotionKey;
    return {
      x: emotionConfig[emotionKey].label,
      y: emotions[emotionKey],
      fill: emotionConfig[emotionKey].color,
    };
  });

  // Format data for Victory Pie Chart
  const pieData = Object.keys(emotions).map(key => {
    const emotionKey = key as EmotionKey;
    return {
      x: emotionConfig[emotionKey].label,
      y: emotions[emotionKey],
      fill: emotionConfig[emotionKey].color,
    };
  });

  const dominantEmotionKey = firstFace.dominantEmotion as EmotionKey;
  const dominantEmotion = emotionConfig[dominantEmotionKey];
  const dominantEmotionValue = emotions[dominantEmotionKey];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>Emotion Analysis</Text>
        </View>

        {/* Mock Data Notice */}
        {isMockData && (
          <View style={styles.mockDataBanner}>
            <MaterialCommunityIcons name="information-outline" size={20} color="#2196F3" />
            <Text style={styles.mockDataText}>
              Using mock data due to API issues
            </Text>
          </View>
        )}

        {/* Dominant Emotion Card */}
        <View style={styles.dominantEmotionContainer}>
          <Text style={styles.sectionTitle}>Your Dominant Emotion</Text>
          <View style={[styles.dominantEmotionCard, { backgroundColor: `${dominantEmotion.color}20` }]}>
            <MaterialCommunityIcons 
              name={dominantEmotion.icon} 
              size={60} 
              color={dominantEmotion.color} 
            />
            <View style={styles.dominantEmotionInfo}>
              <Text style={styles.dominantEmotionName}>{dominantEmotion.label}</Text>
              <Text style={styles.dominantEmotionValue}>{dominantEmotionValue.toFixed(1)}%</Text>
            </View>
          </View>
        </View>

        {/* Bar Chart */}
        <View style={styles.chartContainer}>
          <Text style={styles.sectionTitle}>Emotion Distribution</Text>
          <View style={styles.chart}>
            {/* <VictoryChart
              theme={VictoryTheme.material}
              domainPadding={20}
              width={width - 40}
              height={220}
            >
              <VictoryBar
                data={barData}
                style={{ data: { fill: ({ datum }) => datum.fill } }}
                animate={{
                  duration: 500,
                  onLoad: { duration: 300 }
                }}
                labels={({ datum }) => `${datum.y.toFixed(1)}%`}
                labelComponent={<VictoryLabel dy={-10} />}
              />
            </VictoryChart> */}
          </View>
        </View>

        {/* Pie Chart */}
        <View style={styles.chartContainer}>
          <Text style={styles.sectionTitle}>Emotion Breakdown</Text>
          <View style={styles.chart}>
            {/* <VictoryPie
              data={pieData}
              colorScale={Object.keys(emotions).map(key => emotionConfig[key as EmotionKey].color)}
              width={width - 40}
              height={220}
              padding={40}
              innerRadius={40}
              labelRadius={90}
              style={{ 
                labels: { 
                  fill: '#333', 
                  fontSize: 12,
                  fontWeight: 'bold'
                }
              }}
              animate={{
                duration: 1000
              }}
              labels={({ datum }) => `${datum.x}: ${datum.y.toFixed(0)}%`} */}
            {/* /> */}
          </View>
        </View>

        {/* Detailed Emotion Breakdown */}
        <View style={styles.emotionListContainer}>
          <Text style={styles.sectionTitle}>Detailed Breakdown</Text>
          {Object.keys(emotions).map((key) => {
            const emotionKey = key as EmotionKey;
            const value = emotions[emotionKey];
            const { color, icon, label } = emotionConfig[emotionKey];
            
            return (
              <View 
                key={emotionKey} 
                style={[
                  styles.emotionListItem,
                  firstFace.dominantEmotion === emotionKey && styles.dominantEmotionListItem
                ]}
              >
                <MaterialCommunityIcons name={icon} size={24} color={color} />
                <Text style={styles.emotionListLabel}>{label}</Text>
                <View style={[styles.emotionProgressOuter, { backgroundColor: `${color}20` }]}>
                  <View 
                    style={[
                      styles.emotionProgressInner, 
                      { 
                        backgroundColor: color,
                        width: `${value}%`
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.emotionListValue}>{value.toFixed(1)}%</Text>
              </View>
            );
          })}
        </View>

        {/* Capture Again Button */}
        <TouchableOpacity 
          style={styles.captureAgainButton} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.captureAgainButtonText}>Capture Again</Text>
          <MaterialCommunityIcons name="camera" size={20} color="#fff" />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  mockDataBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  mockDataText: {
    marginLeft: 8,
    color: '#2196F3',
    fontSize: 14,
  },
  dominantEmotionContainer: {
    marginBottom: 20,
  },
  dominantEmotionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    padding: 20,
    borderRadius: 12,
  },
  dominantEmotionInfo: {
    marginLeft: 16,
  },
  dominantEmotionName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  dominantEmotionValue: {
    fontSize: 18,
    color: '#666',
  },
  chartContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  chart: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
  },
  emotionListContainer: {
    marginBottom: 20,
  },
  emotionListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  dominantEmotionListItem: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  emotionListLabel: {
    width: 80,
    marginLeft: 8,
    color: '#333',
    fontSize: 14,
  },
  emotionProgressOuter: {
    flex: 1,
    height: 10,
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    overflow: 'hidden',
    marginHorizontal: 8,
  },
  emotionProgressInner: {
    height: '100%',
    borderRadius: 10,
  },
  emotionListValue: {
    width: 50,
    textAlign: 'right',
    color: '#666',
    fontSize: 14,
  },
  captureAgainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6A1B9A',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  captureAgainButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 20,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#6A1B9A',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EmotionChart; 