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
import { answerQuestion, nextQuestion, resetCurrentQuiz, submitQuizScore } from '../store/slices/quizSlice';
import { RootState } from '../store/store';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../types/navigation';

const QuizGameScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const { selectedQuiz, currentQuestion, userAnswers } = useSelector((state: RootState) => state.quiz);
  
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [startTime] = useState(Date.now());
  
  // Calculate current score
  const score = userAnswers.filter(answer => answer.isCorrect).length;
  
  // If no quiz is selected, redirect back to games screen
  useEffect(() => {
    if (!selectedQuiz) {
      navigation.goBack();
    }
  }, [selectedQuiz, navigation]);
  
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
  
  const currentQuizQuestion = selectedQuiz.questions[currentQuestion];
  const isLastQuestion = currentQuestion === selectedQuiz.questions.length - 1;
  
  const handleAnswerSelect = (answer: string, isCorrect: boolean) => {
    if (showFeedback) return; // Prevent selecting another answer during feedback
    
    setSelectedAnswer(answer);
    setIsCorrect(isCorrect);
    setShowFeedback(true);
    
    // Find the index of the selected option
    const selectedOptionIndex = currentQuizQuestion.options.findIndex(opt => opt === answer);
    
    dispatch(answerQuestion({
      questionIndex: currentQuestion,
      selectedOption: selectedOptionIndex,
      isCorrect,
    }));
    
    // If last question, submit score after a delay
    if (isLastQuestion) {
      const timeTaken = Math.floor((Date.now() - startTime) / 1000); // Time in seconds
      
      setTimeout(() => {
        dispatch(submitQuizScore({
          userId: "68093c155180515753ba66aa", // In a real app, get this from auth state
          quizId: selectedQuiz.id,
          score: score + (isCorrect ? 1 : 0), // Add current answer to score
          totalQuestions: selectedQuiz.questions.length,
          timeTaken: timeTaken
        }));
        
        // Show completion alert
        Alert.alert(
          "Quiz Completed!",
          `You scored ${score + (isCorrect ? 1 : 0)} out of ${selectedQuiz.questions.length}`,
          [
            { 
              text: "View Results", 
              onPress: () => {
                dispatch(resetCurrentQuiz());
                navigation.goBack();
              }
            }
          ]
        );
      }, 1500);
    }
  };
  
  const handleNextQuestion = () => {
    setSelectedAnswer(null);
    setShowFeedback(false);
    dispatch(nextQuestion());
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => {
              Alert.alert(
                "Quit Quiz?",
                "Your progress will be lost.",
                [
                  { text: "Cancel", style: "cancel" },
                  { 
                    text: "Quit", 
                    onPress: () => {
                      dispatch(resetCurrentQuiz());
                      navigation.goBack();
                    }
                  }
                ]
              );
            }}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>{selectedQuiz.title}</Text>
        </View>
        
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${((currentQuestion + 1) / selectedQuiz.questions.length) * 100}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            Question {currentQuestion + 1} of {selectedQuiz.questions.length}
          </Text>
        </View>
        
        <View style={styles.questionContainer}>
          <Text style={styles.questionText}>{currentQuizQuestion.text}</Text>
          
          {currentQuizQuestion.options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.answerOption,
                selectedAnswer === option && (isCorrect ? styles.correctAnswer : styles.incorrectAnswer)
              ]}
              onPress={() => handleAnswerSelect(option, index === currentQuizQuestion.correctAnswerIndex)}
              disabled={showFeedback}
            >
              <Text style={styles.answerText}>{option}</Text>
              {showFeedback && selectedAnswer === option && (
                <MaterialCommunityIcons 
                  name={isCorrect ? "check-circle" : "close-circle"} 
                  size={24} 
                  color={isCorrect ? "#4CAF50" : "#F44336"} 
                />
              )}
            </TouchableOpacity>
          ))}
        </View>
        
        {showFeedback && (
          <View style={styles.feedbackContainer}>
            <Text style={[
              styles.feedbackText, 
              { color: isCorrect ? "#4CAF50" : "#F44336" }
            ]}>
              {isCorrect ? "Correct!" : "Incorrect!"}
            </Text>
            {!isCorrect && (
              <Text style={styles.correctAnswerText}>
                The correct answer is: {currentQuizQuestion.options[currentQuizQuestion.correctAnswerIndex]}
              </Text>
            )}
            
            {!isLastQuestion && (
              <TouchableOpacity 
                style={styles.nextButton}
                onPress={handleNextQuestion}
              >
                <Text style={styles.nextButtonText}>Next Question</Text>
                <MaterialCommunityIcons name="arrow-right" size={20} color="#FFF" />
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
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
    marginTop: 8,
    textAlign: 'right',
  },
  questionContainer: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
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
  questionText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  answerOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F0E6FA',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E1BEE7',
  },
  correctAnswer: {
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
  },
  incorrectAnswer: {
    backgroundColor: '#FFEBEE',
    borderColor: '#F44336',
  },
  answerText: {
    fontSize: 16,
    color: '#333',
  },
  feedbackContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  feedbackText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  correctAnswerText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 16,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6A1B9A',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    marginTop: 16,
  },
  nextButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
});

export default QuizGameScreen; 