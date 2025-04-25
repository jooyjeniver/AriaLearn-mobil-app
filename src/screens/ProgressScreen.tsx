import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Dimensions,
  TouchableOpacity,
  Platform,
  Image,
  ActivityIndicator,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { launchCamera } from 'react-native-image-picker';
import { analyzeEmotion } from '../services/emotionAnalysisService';
import api from '../services/api';
import {
  setCurrentAnalysis,
  setIsAnalyzing,
  setError,
} from '../store/slices/emotionSlice';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SubjectProgress {
  subject: string;
  progress: number;
  icon: string;
  color: string;
  totalLessons: number;
  completedLessons: number;
}

interface EmotionData {
  date: string;
  emotion: 'happy' | 'neutral' | 'sad' | 'excited' | 'confused';
  intensity: number;
}

const SUBJECTS: SubjectProgress[] = [
  {
    subject: 'Myself and My Family',
    progress: 75,
    icon: 'account-group',
    color: '#2196F3',
    totalLessons: 20,
    completedLessons: 15,
  },
  {
    subject: 'Our School and Community',
    progress: 60,
    icon: 'school',
    color: '#4CAF50',
    totalLessons: 18,
    completedLessons: 11,
  },
  {
    subject: 'Good Habits and Citizenship',
    progress: 85,
    icon: 'hand-heart',
    color: '#9C27B0',
    totalLessons: 15,
    completedLessons: 13,
  },
  {
    subject: 'My Environment',
    progress: 45,
    icon: 'nature',
    color: '#FF9800',
    totalLessons: 12,
    completedLessons: 5,
  },
  {
    subject: 'Time and History',
    progress: 65,
    icon: 'clock-time-four',
    color: '#E91E63',
    totalLessons: 16,
    completedLessons: 10,
  }
];

const getEmotionIcon = (emotion: string) => {
  const icons = {
    joy: 'emoticon-happy',
    sadness: 'emoticon-sad',
    anger: 'emoticon-angry',
    fear: 'emoticon-scared',
    surprise: 'emoticon-excited',
    neutral: 'emoticon-neutral',
  };
  return icons[emotion as keyof typeof icons] || 'emoticon-neutral';
};

const ProgressScreen: React.FC = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('week');
  const [isLoading, setIsLoading] = useState(true);
  const [subjects, setSubjects] = useState<SubjectProgress[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const dispatch = useDispatch();
  const { currentAnalysis, isAnalyzing, error, analysisHistory = [] } = useSelector(
    (state: RootState) => state.emotion
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setLoadError(null);
        
        // Fetch subjects data
        const subjectsResponse = await api.get('/v1/subjects');
        if (subjectsResponse.data) {
          const formattedSubjects = subjectsResponse.data.map((subject: any) => ({
            subject: subject.name,
            progress: subject.progress || 0,
            icon: subject.icon || 'book',
            color: subject.color || '#2196F3',
            totalLessons: subject.totalLessons || 0,
            completedLessons: subject.completedLessons || 0,
          }));
          setSubjects(formattedSubjects);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setLoadError('Failed to load progress data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const averageConfidence = analysisHistory?.length > 0
    ? analysisHistory.reduce((sum, analysis) => sum + (analysis?.data?.confidence || 0), 0) / analysisHistory.length
    : 0;

  const captureAndAnalyzeEmotion = async () => {
    try {
      const result = await launchCamera({
        mediaType: 'photo',
        quality: 0.8,
        includeBase64: false,
      });

      if (result.assets && result.assets[0]?.uri) {
        dispatch(setIsAnalyzing(true));
        const analysis = await analyzeEmotion(result.assets[0].uri);
        dispatch(setCurrentAnalysis(analysis));
      }
    } catch (error) {
      console.error('Error capturing or analyzing image:', error);
      dispatch(setError(error instanceof Error ? error.message : 'An error occurred'));
    }
  };

  const chartData = {
    labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].slice(0, 7),
    datasets: [{
      data: analysisHistory?.slice(-7).map(analysis => (analysis?.data?.confidence || 0) * 100) || [0],
    }],
  };

  const SubjectCard = ({ subject }: { subject: SubjectProgress }) => (
    <TouchableOpacity style={styles.subjectCard}>
      <LinearGradient
        colors={[`${subject.color}20`, `${subject.color}10`]}
        style={styles.subjectCardContent}>
        <View style={styles.subjectIconContainer}>
          <MaterialCommunityIcons
            name={subject.icon}
            size={32}
            color={subject.color}
          />
        </View>
        <View style={styles.subjectInfo}>
          <Text style={styles.subjectTitle}>{subject.subject}</Text>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${subject.progress}%`, backgroundColor: subject.color },
                ]}
              />
            </View>
            <Text style={styles.progressText}>{subject.progress}%</Text>
          </View>
          <Text style={styles.lessonCount}>
            {subject.completedLessons}/{subject.totalLessons} Lessons
          </Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const EmotionAnalysisCard = () => (
    <View style={styles.analysisCard}>
      <Text style={styles.analysisTitle}>Current Emotional State</Text>
      {isAnalyzing ? (
        <Text style={styles.analyzingText}>Analyzing your emotion...</Text>
      ) : currentAnalysis?.data ? (
        <>
          <View style={styles.emotionResult}>
            <MaterialCommunityIcons
              name={getEmotionIcon(currentAnalysis.data.dominantEmotion)}
              size={32}
              color="#6A1B9A"
            />
            <Text style={styles.dominantEmotion}>
              {currentAnalysis.data.dominantEmotion.charAt(0).toUpperCase() + 
               currentAnalysis.data.dominantEmotion.slice(1)}
            </Text>
          </View>
          <Text style={styles.confidence}>
            Confidence: {Math.round((currentAnalysis.data.confidence || 0) * 100)}%
          </Text>
          <Text style={styles.analysis}>{currentAnalysis.data.analysis}</Text>
          <View style={styles.suggestions}>
            {currentAnalysis.data.suggestions?.map((suggestion, index) => (
              <Text key={index} style={styles.suggestion}>• {suggestion}</Text>
            ))}
          </View>
        </>
      ) : (
        <TouchableOpacity
          style={styles.captureButton}
          onPress={captureAndAnalyzeEmotion}>
          <MaterialCommunityIcons name="camera" size={24} color="#FFF" />
          <Text style={styles.captureButtonText}>Analyze My Emotion</Text>
        </TouchableOpacity>
      )}
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6A1B9A" />
          <Text style={styles.loadingText}>Loading your progress...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (loadError) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons name="alert-circle" size={48} color="#D32F2F" />
          <Text style={styles.errorText}>{loadError}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => setIsLoading(true)}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.title}>My Progress</Text>
          <View style={styles.timeframeSelector}>
            {['week', 'month', 'year'].map((timeframe) => (
              <TouchableOpacity
                key={timeframe}
                style={[
                  styles.timeframeButton,
                  selectedTimeframe === timeframe && styles.selectedTimeframe,
                ]}
                onPress={() => setSelectedTimeframe(timeframe)}>
                <Text
                  style={[
                    styles.timeframeText,
                    selectedTimeframe === timeframe && styles.selectedTimeframeText,
                  ]}>
                  {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <EmotionAnalysisCard />

        <View style={styles.emotionSection}>
          <Text style={styles.sectionTitle}>Emotional Journey</Text>
          <View style={styles.emotionSummary}>
            <View style={styles.emotionCard}>
              <MaterialCommunityIcons
                name={analysisHistory?.length > 0
                  ? getEmotionIcon(analysisHistory[analysisHistory.length - 1]?.data?.dominantEmotion || 'neutral')
                  : 'emoticon-neutral'}
                size={32}
                color="#6A1B9A"
              />
              <Text style={styles.emotionText}>Current Mood</Text>
            </View>
            <View style={styles.emotionCard}>
              <Text style={styles.averageScore}>{Math.round(averageConfidence * 100)}%</Text>
              <Text style={styles.emotionText}>Avg. Confidence</Text>
            </View>
          </View>
          <View style={styles.chartContainer}>
            <LineChart
              data={chartData}
              width={SCREEN_WIDTH - 32}
              height={180}
              chartConfig={{
                backgroundColor: '#ffffff',
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(106, 27, 154, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
              }}
              bezier
              style={styles.chart}
            />
          </View>
        </View>

        <View style={styles.subjectsSection}>
          <Text style={styles.sectionTitle}>Subject Progress</Text>
          <View style={styles.subjectsGrid}>
            {subjects.map((subject) => (
              <SubjectCard key={subject.subject} subject={subject} />
            ))}
          </View>
        </View>

        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Learning Stats</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <MaterialCommunityIcons name="clock-outline" size={24} color="#6A1B9A" />
              <Text style={styles.statValue}>24.5h</Text>
              <Text style={styles.statLabel}>Study Time</Text>
            </View>
            <View style={styles.statCard}>
              <MaterialCommunityIcons name="star" size={24} color="#6A1B9A" />
              <Text style={styles.statValue}>85%</Text>
              <Text style={styles.statLabel}>Avg. Score</Text>
            </View>
            <View style={styles.statCard}>
              <MaterialCommunityIcons name="check-circle" size={24} color="#6A1B9A" />
              <Text style={styles.statValue}>44</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
          </View>
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
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  timeframeSelector: {
    flexDirection: 'row',
    backgroundColor: '#F0E6FA',
    borderRadius: 20,
    padding: 4,
  },
  timeframeButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 16,
  },
  selectedTimeframe: {
    backgroundColor: '#6A1B9A',
  },
  timeframeText: {
    color: '#6A1B9A',
    fontSize: 14,
    fontWeight: '600',
  },
  selectedTimeframeText: {
    color: '#FFF',
  },
  emotionSection: {
    padding: 16,
    backgroundColor: '#FFF',
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  emotionSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  emotionCard: {
    flex: 1,
    backgroundColor: '#F0E6FA',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 8,
    alignItems: 'center',
  },
  emotionText: {
    color: '#6A1B9A',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  averageScore: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6A1B9A',
  },
  chartContainer: {
    marginTop: 16,
    borderRadius: 16,
    backgroundColor: '#FFF',
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
  chart: {
    borderRadius: 16,
    paddingRight: 16,
  },
  subjectsSection: {
    padding: 16,
  },
  subjectsGrid: {
    gap: 16,
  },
  subjectCard: {
    borderRadius: 12,
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
  subjectCardContent: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  subjectIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  subjectInfo: {
    flex: 1,
  },
  subjectTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    marginRight: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
  },
  lessonCount: {
    fontSize: 12,
    color: '#666',
  },
  statsSection: {
    padding: 16,
    backgroundColor: '#FFF',
    marginTop: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F0E6FA',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
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
  analysisCard: {
    backgroundColor: '#FFF',
    margin: 16,
    padding: 16,
    borderRadius: 12,
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
  analysisTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  captureButton: {
    backgroundColor: '#6A1B9A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  captureButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  analyzingText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
  },
  emotionResult: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 8,
  },
  dominantEmotion: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6A1B9A',
  },
  confidence: {
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
    marginBottom: 8,
  },
  analysis: {
    color: '#333',
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  suggestions: {
    backgroundColor: '#F0E6FA',
    padding: 12,
    borderRadius: 8,
  },
  suggestion: {
    color: '#6A1B9A',
    fontSize: 14,
    marginBottom: 4,
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: '#6A1B9A',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProgressScreen; 