import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '../store/hooks';
import { answerQuestion, nextQuestion, resetCurrentQuiz } from '../store/slices/quizSlice';
import { RootState } from '../store/store';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';

const QuizGameScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const { selectedQuiz, currentQuestion, userAnswers } = useSelector((state: RootState) => state.quiz);
  const [answered, setAnswered] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  useEffect(() => {
    if (!selectedQuiz) {
      Alert.alert('Error', 'No quiz selected!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    }
  }, [selectedQuiz, navigation]);

  // If no quiz is selected yet, show loading
  if (!selectedQuiz) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6A1B9A" />
          <Text style={styles.loadingText}>Loading quiz...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const questions = selectedQuiz.questions || [];
  const question = questions[currentQuestion];

  // Safety check for valid question
  if (!question) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons name="alert-circle-outline" size={60} color="#F44336" />
          <Text style={styles.errorText}>Question not found</Text>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Back to Games</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleOptionSelect = (optionIndex: number) => {
    if (answered) return; // Prevent selecting after already answering
    
    const isCorrect = optionIndex === question.correctAnswerIndex;
    setSelectedOption(optionIndex);
    setAnswered(true);
    
    // Dispatch action to record the answer
    dispatch(answerQuestion({
      questionIndex: currentQuestion,
      selectedOption: optionIndex,
      isCorrect
    }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      dispatch(nextQuestion());
      setAnswered(false);
      setSelectedOption(null);
    } else {
      // End of quiz
      const correctAnswers = userAnswers.filter(a => a.isCorrect).length;
      
      Alert.alert(
        'Quiz Completed!',
        `You got ${correctAnswers} out of ${questions.length} questions correct.`,
        [
          {
            text: 'Back to Games',
            onPress: () => {
              dispatch(resetCurrentQuiz());
              navigation.goBack();
            },
          },
        ]
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backIcon} 
          onPress={() => {
            Alert.alert(
              'Exit Quiz',
              'Are you sure you want to exit? Your progress will be lost.',
              [
                { text: 'Cancel', style: 'cancel' },
                { 
                  text: 'Exit', 
                  onPress: () => {
                    dispatch(resetCurrentQuiz());
                    navigation.goBack();
                  } 
                },
              ]
            )
          }}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.quizTitle}>{selectedQuiz.title}</Text>
      </View>
      
      <View style={styles.progressBar}>
        <View 
          style={[
            styles.progressFill, 
            { width: `${((currentQuestion + 1) / questions.length) * 100}%` }
          ]} 
        />
      </View>
      <Text style={styles.progressText}>
        Question {currentQuestion + 1} of {questions.length}
      </Text>
      
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.questionCard}>
          <Text style={styles.questionText}>{question.text}</Text>
          
          <View style={styles.optionsContainer}>
            {question.options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionButton,
                  answered && selectedOption === index && 
                    (index === question.correctAnswerIndex ? 
                      styles.correctOption : styles.incorrectOption),
                  answered && index === question.correctAnswerIndex && 
                    styles.correctOption
                ]}
                onPress={() => handleOptionSelect(index)}
                disabled={answered}
              >
                <Text 
                  style={[
                    styles.optionText,
                    answered && (
                      index === question.correctAnswerIndex || 
                      selectedOption === index
                    ) && styles.answeredOptionText
                  ]}
                >
                  {option}
                </Text>
                {answered && index === question.correctAnswerIndex && (
                  <MaterialCommunityIcons name="check-circle" size={20} color="#fff" style={styles.optionIcon} />
                )}
                {answered && selectedOption === index && index !== question.correctAnswerIndex && (
                  <MaterialCommunityIcons name="close-circle" size={20} color="#fff" style={styles.optionIcon} />
                )}
              </TouchableOpacity>
            ))}
          </View>
          
          {answered && (
            <View style={styles.explanationContainer}>
              <Text style={styles.explanationTitle}>
                {selectedOption === question.correctAnswerIndex ? 'Correct!' : 'Incorrect!'}
              </Text>
              <Text style={styles.explanationText}>
                {question.explanation || 'The correct answer is ' + question.options[question.correctAnswerIndex]}
              </Text>
            </View>
          )}
        </View>
        
        {answered && (
          <TouchableOpacity 
            style={styles.nextButton} 
            onPress={handleNext}
          >
            <Text style={styles.nextButtonText}>
              {currentQuestion < questions.length - 1 ? 'Next Question' : 'Complete Quiz'}
            </Text>
            <MaterialCommunityIcons 
              name={currentQuestion < questions.length - 1 ? 'arrow-right' : 'check'} 
              size={20} 
              color="#fff" 
            />
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
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
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  backButton: {
    backgroundColor: '#6A1B9A',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backIcon: {
    padding: 8,
  },
  quizTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    margin: 16,
    marginTop: 8,
    marginBottom: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6A1B9A',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  questionCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
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
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
  },
  optionsContainer: {
    marginBottom: 16,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  answeredOptionText: {
    color: '#FFF',
    fontWeight: '600',
  },
  correctOption: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  incorrectOption: {
    backgroundColor: '#F44336',
    borderColor: '#F44336',
  },
  optionIcon: {
    marginLeft: 8,
  },
  explanationContainer: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 16,
    marginTop: 8,
  },
  explanationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  explanationText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  nextButton: {
    backgroundColor: '#6A1B9A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
    marginRight: 8,
  },
});

export default QuizGameScreen; 