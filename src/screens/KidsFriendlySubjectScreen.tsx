import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Animated,
  Easing,
  Dimensions,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  FlatList,
  ImageBackground,
  Alert,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { MainStackParamList } from '../types/navigation';
import { useToast } from '../context/ToastContext';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchLessonDetail, selectCurrentLesson, selectLessonsLoading, selectLessonsError } from '../store/slices/lessonsSlice';

// Get screen dimensions for responsive design
const { width, height } = Dimensions.get('window');

type SubjectDetailsScreenProps = {
  navigation: NativeStackNavigationProp<MainStackParamList, 'SubjectDetails'>;
  route: RouteProp<MainStackParamList, 'SubjectDetails'>;
};

const KidsFriendlySubjectScreen: React.FC<SubjectDetailsScreenProps> = ({ navigation, route }) => {
  const { subjectId, subjectName = "Myself and My Family", subjectColor = '#FF6F00', subjectIcon = 'book-open-variant' } = route.params || {};
  const { showToast } = useToast();
  const dispatch = useAppDispatch();
  const currentLesson = useAppSelector(selectCurrentLesson);
  
  // Animation values
  const [fadeAnim, setFadeAnim] = useState(new Animated.Value(0));
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const bounce = useRef(new Animated.Value(0)).current;
  const wobble = useRef(new Animated.Value(0)).current;
  
  // Interpolated values for animations
  const rotateInterpolate = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });
  
  const wobbleInterpolate = wobble.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-15deg', '0deg', '15deg']
  });
  
  // Tab state
  const [activeTab, setActiveTab] = useState('lessons');
  
  // Log when the active tab changes
  useEffect(() => {
    console.log("Active tab changed to:", activeTab);
    console.log("Lessons available:", compatibleModule.lessons.length);
    console.log("Quizzes available:", compatibleModule.quizzes.length);
  }, [activeTab]);

  useEffect(() => {
    try {
      if (subjectId) {
        dispatch(fetchLessonDetail(subjectId));
      } else {
        console.error('Missing subjectId in route params!');
      }
    } catch (err) {
      console.error('Error fetching lesson:', err);
    }
  }, [dispatch, subjectId]);

  useEffect(() => {
    console.log('Current lesson updated:', currentLesson);
    
    // If we have API data and no matching module, create it from API data
    if (currentLesson && !currentModule) {
      console.log('Using API data to create module');
      
      // Create quizzes from API data if available
      const apiQuizzes = currentLesson.quizzes?.length > 0 
        ? currentLesson.quizzes.map((quiz, index) => ({
            id: `api-quiz-${index}`,
            question: quiz.question || `Quiz ${index + 1}`,
            title: quiz.question || `Quiz ${index + 1}`,
            difficulty: quiz.difficulty || 'medium',
            options: quiz.options || ["Option A", "Option B", "Option C", "Option D"],
            correctAnswer: quiz.answer || "Option A"
          }))
        : HARDCODED_QUIZZES; // Use hardcoded quizzes instead of fallbackQuizzes
      
      // Update compatibleModule with API data
      compatibleModule.title = currentLesson.title || compatibleModule.title;
      compatibleModule.description = currentLesson.description || compatibleModule.description;
      compatibleModule.difficulty = currentLesson.difficulty || compatibleModule.difficulty;
      
      // If no quizzes in compatibleModule, use API quizzes
      if (!compatibleModule.quizzes || compatibleModule.quizzes.length === 0) {
        compatibleModule.quizzes = apiQuizzes;
        console.log('Added API quizzes to module:', apiQuizzes.length);
      }
      
      // Update animations for new content
      if (apiQuizzes.length > 0) {
        setQuizAnimations(createAnimations(apiQuizzes.length));
      }
    }
  }, [currentLesson]);
  
  // Helper function to create animations (moved here so it can be used in useEffect)
  const createAnimations = (count, delayFactor = 100) => {
    return Array.from({ length: count }, (_, i) => ({
      opacity: new Animated.Value(0),
      scale: new Animated.Value(0.9),
      transition: new Animated.Value(50)
    }));
  };
  
  // Replace hardcoded module data with array
  const moduleData = [
    {
        "topic": "Myself and My Family",
        "title": "Who Am I?",
        "order": 1,
        "description": "Explore your name, age, and favorite things.",
        "subLessons": [
          {
            "title": "My Name",
            "explanation": "Every person has a name that makes them special. In this lesson, you'll learn how to say, spell, and write your name clearly."
          },
          {
            "title": "My Age",
            "explanation": "Your age tells you how many years old you are. This sub-lesson helps children understand how to count their age and compare it with their friends."
          },
          {
            "title": "My Favorites",
            "explanation": "We all like different things. Learn to express what you love the most — like your favorite food, color, toy, or animal."
          }
        ],
        "quiz": [
          {
            "question": "What is your name?",
            "type": "open-ended",
            "placeholder": "Type your name here"
          },
          {
            "question": "How old are you?",
            "type": "open-ended",
            "placeholder": "Type your age"
          }
        ]
    },
    {
        "topic": "Myself and My Family",
        "title": "My Special Family Tree",
        "order": 2,
        "description": "Understand family relationships and how members are connected.",
        "subLessons": [
          {
            "title": "What is a Family Tree?",
            "explanation": "A family tree shows how you are connected to your family members. It's like a map of your relatives."
          },
          {
            "title": "Different Family Members",
            "explanation": "Learn about the people in your family — like parents, grandparents, siblings, uncles, and aunts — and how they are related to you."
          },
          {
            "title": "Drawing Your Family Tree",
            "explanation": "Discover how to draw your own family tree with names and relationships. It's a fun way to see how everyone is connected!"
          }
        ],
        "quiz": [
          {
            "question": "Who is your mother's father?",
            "type": "multiple-choice",
            "options": [
              "Uncle",
              "Grandfather",
              "Brother",
              "Cousin"
            ],
            "answer": "Grandfather"
          }
        ]
    },
    {
        "topic": "Myself and My Family",
        "title": "Helping Hands at Home",
        "order": 3,
        "description": "Learn about responsibilities and helping each other at home.",
        "subLessons": [
          {
            "title": "What Are Responsibilities?",
            "explanation": "Responsibilities are the things we should do to take care of ourselves and others. Everyone in a family has their own jobs."
          },
          {
            "title": "Helping at Home",
            "explanation": "Children can help at home in many ways like cleaning, organizing toys, or helping set the table. Every small task makes a big difference!"
          },
          {
            "title": "Working Together as a Family",
            "explanation": "When family members help one another, the home becomes a happy place. Learn why teamwork is important in a family."
          }
        ],
        "quiz": [
          {
            "question": "What can you do to help at home?",
            "type": "open-ended",
            "placeholder": "Type your answer"
          }
        ]
    },
    {
        "topic": "Our School and Community",
        "title": "My School",
        "order": 1,
        "description": "Explore your school and its important people.",
        "subLessons": [
          {
            "title": "What is a School?",
            "explanation": "A school is a place where you go to learn new things. It's filled with teachers, students, and staff who help you grow."
          },
          {
            "title": "Important People at School",
            "explanation": "In school, there are many people who help you, like your teachers, principals, and even the janitors. Learn about their roles."
          },
          {
            "title": "Different Classes at School",
            "explanation": "At school, you take different classes like math, science, art, and more. These classes help you learn about the world around you."
          }
        ],
        "quiz": [
          {
            "question": "Who helps you learn at school?",
            "type": "multiple-choice",
            "options": [
              "Teacher",
              "Driver",
              "Parent",
              "Cook"
            ],
            "answer": "Teacher"
          }
        ]
    },
    {
        "topic": "Our School and Community",
        "title": "Classroom Rules",
        "order": 2,
        "description": "Learn about the importance of following rules in school.",
        "subLessons": [
          {
            "title": "What Are Classroom Rules?",
            "explanation": "Classroom rules help create a safe and respectful environment for learning. They help us work together and focus on our studies."
          },
          {
            "title": "Why We Follow Rules",
            "explanation": "When we follow rules, we make sure everyone feels happy, safe, and ready to learn. It helps the classroom stay organized."
          }
        ],
        "quiz": [
          {
            "question": "Why do we follow rules in the classroom?",
            "type": "open-ended",
            "placeholder": "Type your answer"
          }
        ]
    },
    {
        "topic": "Our School and Community",
        "title": "Community Helpers",
        "order": 3,
        "description": "Identify people who help in our community like doctors and police officers.",
        "subLessons": [
          {
            "title": "Who Are Community Helpers?",
            "explanation": "Community helpers are people who work to make our lives better, like doctors, teachers, and firefighters."
          },
          {
            "title": "Different Types of Helpers",
            "explanation": "Learn about the different people who help us, such as doctors, police officers, and firefighters, and the important jobs they do."
          }
        ],
        "quiz": [
          {
            "question": "Which of these is a community helper?",
            "type": "multiple-choice",
            "options": [
              "Singer",
              "Doctor",
              "Athlete",
              "Dancer"
            ],
            "answer": "Doctor"
          }
        ]
    },
    {
        "topic": "Our School and Community",
        "title": "Important Places",
        "order": 4,
        "description": "Learn about hospitals, police stations, and other key places.",
        "subLessons": [
          {
            "title": "What Are Important Places?",
            "explanation": "Important places in our community include hospitals, police stations, and schools, which help keep us safe and healthy."
          },
          {
            "title": "Where Are These Places?",
            "explanation": "Learn about the locations of important places in your community and why they are important."
          }
        ],
        "quiz": [
          {
            "question": "Name one important place in your town.",
            "type": "open-ended",
            "placeholder": "Type here"
          }
        ]
    },
    {
        "topic": "My Environment",
        "title": "Natural and Man-made Things",
        "order": 1,
        "description": "Distinguish between natural items and things made by people.",
        "subLessons": [
          {
            "title": "What Are Natural Things?",
            "explanation": "Natural things are those that come from nature, like trees, mountains, and rivers."
          },
          {
            "title": "What Are Man-made Things?",
            "explanation": "Man-made things are objects that people create, such as buildings, cars, and chairs."
          }
        ],
        "quiz": [
          {
            "question": "Which one is man-made?",
            "type": "multiple-choice",
            "options": [
              "River",
              "Mountain",
              "Chair",
              "Tree"
            ],
            "answer": "Chair"
          }
        ]
    },
    {
        "topic": "My Environment",
        "title": "Animals Around Us",
        "order": 2,
        "description": "Recognize animals that live around us and their habitats.",
        "subLessons": [
          {
            "title": "Wild and Domestic Animals",
            "explanation": "Wild animals live in the forest or jungles, while domestic animals live with us at home, like dogs and cats."
          },
          {
            "title": "Habitats of Animals",
            "explanation": "Animals live in different habitats, such as forests, deserts, and oceans. Each habitat provides food and shelter for the animals."
          }
        ],
        "quiz": [
          {
            "question": "Which of these is a wild animal?",
            "type": "multiple-choice",
            "options": [
              "Cow",
              "Lion",
              "Dog",
              "Goat"
            ],
            "answer": "Lion"
          }
        ]
    },
    {
        "topic": "My Environment",
        "title": "Plants and Trees",
        "order": 3,
        "description": "Learn the value of trees and plants.",
        "subLessons": [
          {
            "title": "What Are Plants?",
            "explanation": "Plants are living things that grow in the ground. They give us oxygen, food, and shelter."
          },
          {
            "title": "The Importance of Trees",
            "explanation": "Trees provide us with fresh air, shade, and even materials like wood and paper."
          }
        ],
        "quiz": [
          {
            "question": "Why are plants important?",
            "type": "open-ended",
            "placeholder": "Type your answer"
          }
        ]
    },
    {
        "topic": "My Environment",
        "title": "Keeping the Environment Clean",
        "order": 4,
        "description": "Understand how to keep our environment clean.",
        "subLessons": [
          {
            "title": "What is a Clean Environment?",
            "explanation": "A clean environment means keeping our surroundings free of trash and pollution, which is important for our health."
          },
          {
            "title": "How Can We Keep the Environment Clean?",
            "explanation": "We can help by not littering, recycling, and picking up trash in our neighborhoods."
          }
        ],
        "quiz": [
          {
            "question": "What should you do with garbage?",
            "type": "multiple-choice",
            "options": [
              "Burn it",
              "Throw it anywhere",
              "Use a dustbin",
              "Hide it"
            ],
            "answer": "Use a dustbin"
          }
        ]
    },
    {
        "topic": "Time and Festivals",
        "title": "Days and Months",
        "order": 1,
        "description": "Learn the names of the days of the week and months of the year.",
        "subLessons": [
          {
            "title": "Days of the Week",
            "explanation": "There are seven days in a week. They are Sunday, Monday, Tuesday, Wednesday, Thursday, Friday, and Saturday."
          },
          {
            "title": "Months of the Year",
            "explanation": "There are twelve months in a year. They are January, February, March, April, May, June, July, August, September, October, November, and December."
          }
        ],
        "quiz": [
          {
            "question": "How many days are in a week?",
            "type": "multiple-choice",
            "options": [
              "5",
              "6",
              "7",
              "8"
            ],
            "answer": "7"
          }
        ]
    },
    {
        "topic": "Time and Festivals",
        "title": "Festivals We Celebrate",
        "order": 2,
        "description": "Discover national and religious festivals in Sri Lanka.",
        "subLessons": [
          {
            "title": "Major Festivals",
            "explanation": "In Sri Lanka, we celebrate various national and religious festivals, such as Vesak, New Year, and Diwali."
          },
          {
            "title": "Festivals and Their Significance",
            "explanation": "Festivals like Vesak and New Year are celebrated with great joy and have cultural, historical, and religious significance."
          }
        ],
        "quiz": [
          {
            "question": "Which festival is celebrated in April?",
            "type": "multiple-choice",
            "options": [
              "Christmas",
              "Vesak",
              "New Year",
              "Diwali"
            ],
            "answer": "New Year"
          }
        ]
    },
    {
        "topic": "Time and Festivals",
        "title": "My Birthday",
        "order": 3,
        "description": "Understand what birthdays are and how we celebrate them.",
        "subLessons": [
          {
            "title": "What is a Birthday?",
            "explanation": "A birthday is the celebration of the day a person was born. People celebrate it with parties, gifts, and well-wishes."
          },
          {
            "title": "Birthday Celebrations",
            "explanation": "Many people celebrate their birthdays with family and friends. Common activities include cake cutting, playing games, and having fun."
          }
        ],
        "quiz": [
          {
            "question": "When is your birthday?",
            "type": "open-ended",
            "placeholder": "Type the month here"
          }
        ]
    },
    {
        "topic": "Good Habits and Citizenship",
        "title": "Polite Words",
        "order": 1,
        "description": "Learn to use polite words like please, sorry, and thank you.",
        "subLessons": [
          {
            "title": "Why Use Polite Words?",
            "explanation": "Using polite words like 'please', 'sorry', and 'thank you' helps show respect and kindness towards others."
          },
          {
            "title": "Examples of Polite Words",
            "explanation": "'Please' is used to make requests, 'sorry' is used to apologize, and 'thank you' is used to express gratitude."
          }
        ],
        "quiz": [
          {
            "question": "Write one polite word you know.",
            "type": "open-ended",
            "placeholder": "Type a polite word"
          }
        ]
    },
    {
        "topic": "Good Habits and Citizenship",
        "title": "Sharing is Caring",
        "order": 2,
        "description": "Understand why sharing is important with friends and family.",
        "subLessons": [
          {
            "title": "Why Is Sharing Important?",
            "explanation": "Sharing helps us build stronger relationships with others, and it makes people feel happy and valued."
          },
          {
            "title": "How to Share",
            "explanation": "Sharing can be done by offering toys, food, or time with others. It shows kindness and care."
          }
        ],
        "quiz": [
          {
            "question": "What is something you can share with a friend?",
            "type": "open-ended",
            "placeholder": "Type your answer"
          }
        ]
    },
    {
        "topic": "Good Habits and Citizenship",
        "title": "Our Flag and Anthem",
        "order": 3,
        "description": "Learn the meaning of our national flag and anthem.",
        "subLessons": [
          {
            "title": "The Meaning of the Flag",
            "explanation": "The Sri Lankan flag has colors and symbols that represent different aspects of the country, including the lion, the bo leaves, and the four symbols in each corner."
          },
          {
            "title": "The National Anthem",
            "explanation": "The national anthem of Sri Lanka reflects the unity, diversity, and pride of the nation. It is sung at important events."
          }
        ],
        "quiz": [
          {
            "question": "What colors are on the Sri Lankan flag?",
            "type": "open-ended",
            "placeholder": "Type your answer"
          }
        ]
    },
    {
        "topic": "Good Habits and Citizenship",
        "title": "Clean and Healthy Habits",
        "order": 4,
        "description": "Explore personal hygiene and good daily habits.",
        "subLessons": [
          {
            "title": "Personal Hygiene",
            "explanation": "Personal hygiene includes practices like washing hands, brushing teeth, and bathing regularly to stay healthy and clean."
          },
          {
            "title": "Healthy Daily Habits",
            "explanation": "Good habits like eating healthy food, exercising, and getting enough sleep help us stay strong and healthy."
          }
        ],
        "quiz": [
          {
            "question": "What should you do before eating?",
            "type": "multiple-choice",
            "options": [
              "Sleep",
              "Watch TV",
              "Wash hands",
              "Play"
            ],
            "answer": "Wash hands"
          }
        ]
    },
    {
        "topic": "Transport and Communication",
        "title": "Wheels, Boats & Wings",
        "order": 1,
        "description": "Identify land, water, and air transportation.",
        "subLessons": [
          {
            "title": "Land Transportation",
            "explanation": "Land transportation includes vehicles like cars, buses, and bicycles, which move on roads."
          },
          {
            "title": "Water and Air Transportation",
            "explanation": "Water transportation involves boats and ships, while air transportation involves airplanes flying in the sky."
          }
        ],
        "quiz": [
          {
            "question": "Which of these travels in the sky?",
            "type": "multiple-choice",
            "options": [
              "Boat",
              "Car",
              "Train",
              "Airplane"
            ],
            "answer": "Airplane"
          }
        ]
    },
    {
        "topic": "Transport and Communication",
        "title": "Travel Safety",
        "order": 2,
        "description": "Learn the basics of road and travel safety.",
        "subLessons": [
          {
            "title": "Road Safety Rules",
            "explanation": "Road safety rules, like crossing at the zebra crossing, help keep us safe when traveling on foot or by vehicle."
          },
          {
            "title": "Travel Safety for Vehicles",
            "explanation": "When traveling in a vehicle, always wear a seatbelt, follow traffic signals, and ensure the driver is safe."
          }
        ],
        "quiz": [
          {
            "question": "Where should you cross the road?",
            "type": "multiple-choice",
            "options": [
              "Anywhere",
              "At traffic lights",
              "At the zebra crossing",
              "Behind cars"
            ],
            "answer": "At the zebra crossing"
          }
        ]
    },
    {
        "topic": "Transport and Communication",
        "title": "How We Communicate",
        "order": 3,
        "description": "Understand ways people share messages and ideas.",
        "subLessons": [
          {
            "title": "Communication Methods",
            "explanation": "People communicate through talking, writing, and non-verbal gestures. We also use technology like phones and computers."
          },
          {
            "title": "Non-verbal Communication",
            "explanation": "Non-verbal communication includes body language, gestures, and facial expressions to convey messages."
          }
        ],
        "quiz": [
          {
            "question": "Which of these is a way to communicate?",
            "type": "multiple-choice",
            "options": [
              "Sleeping",
              "Talking",
              "Eating",
              "Jumping"
            ],
            "answer": "Talking"
          }
        ]
    }
  ];

  // Animation state for lesson and quiz cards
  const [lessonAnimations, setLessonAnimations] = useState([]);
  const [quizAnimations, setQuizAnimations] = useState([]);
  
  // Topic color mapping for consistent colors based on topic
  const topicColorMap = {
    "Myself and My Family": "#2196F3",
    "Our School and Community": "#4CAF50",
    "My Environment": "#FF9800",
    "Time and Festivals": "#E91E63",
    "Good Habits and Citizenship": "#9C27B0",
    "Transport and Communication": "#00BCD4"
  };
  
  // Find the correct module based on the subject name
  const findModule = (subjectName) => {
    console.log("Finding module for subject:", subjectName);
    
    if (!subjectName) {
      console.log("No subject name provided, defaulting to first module");
      return moduleData[0];
    }
    
    // Normalize the search term
    const searchTerm = subjectName.toLowerCase().trim();
    console.log("Normalized search term:", searchTerm);
    
    // Debug: Log all module titles and topics
    console.log("Available modules to match against:");
    moduleData.forEach((module, index) => {
      console.log(`Module ${index}: title="${module.title}", topic="${module.topic}"`);
    });
    
    // Try to find by exact title match
    let foundModule = moduleData.find(m => 
      (m.title && m.title.toLowerCase() === searchTerm) || 
      (m.topic && m.topic.toLowerCase() === searchTerm)
    );
    
    if (foundModule) {
      console.log("Found exact match:", foundModule.title);
      return foundModule;
    }
    
    // If no exact match, try partial match
    foundModule = moduleData.find(m => 
      (m.title && m.title.toLowerCase().includes(searchTerm)) || 
      (m.topic && m.topic.toLowerCase().includes(searchTerm))
    );
    
    if (foundModule) {
      console.log("Found partial match:", foundModule.title);
      return foundModule;
    }
    
    console.log("No match found, defaulting to first module");
    return moduleData[0];
  };
  
  // Get module data based on the navigation params
  const selectedSubject = route.params;
  console.log("Route params:", JSON.stringify(selectedSubject));
  console.log("Subject name from params:", selectedSubject.subjectName);
  
  // Try to find the module by name, or use the first one matching the category, or just use the first module
  let currentModule = findModule(selectedSubject.subjectName);
  
  // Debug the module data
  console.log("Current module found:", currentModule ? "Yes" : "No");
  console.log("Current module title:", currentModule?.title);
  console.log("Current module subLessons:", currentModule?.subLessons?.length || 0);
  console.log("Current module quiz:", currentModule?.quiz?.length || 0);
  
  // FORCE DATA: Create hardcoded lessons and quizzes that will definitely work
  const HARDCODED_LESSONS = [
    {
      id: "hardcoded-lesson-1",
      title: "Introduction to Learning",
      description: "This is an introduction to the fascinating world of learning!",
      content: "Learning is a lifelong journey filled with discovery and wonder."
    },
    {
      id: "hardcoded-lesson-2",
      title: "Foundation Concepts",
      description: "Learn about the key concepts that form the foundation of this subject.",
      content: "Understanding these core concepts will help you build knowledge in this area."
    },
    {
      id: "hardcoded-lesson-3",
      title: "Practical Applications",
      description: "Discover how these concepts apply to real-world situations.",
      content: "Seeing how these ideas work in practice helps cement your understanding."
    }
  ];
  
  const HARDCODED_QUIZZES = [
    {
      id: "hardcoded-quiz-1",
      title: "Knowledge Check",
      question: "What is the most important part of learning?",
      options: ["Memorization", "Practice", "Curiosity", "Grades"],
      correctAnswer: "Curiosity"
    },
    {
      id: "hardcoded-quiz-2",
      title: "Progress Assessment",
      question: "How do you know you're making progress?",
      options: ["When you can explain it to others", "When you get a certificate", "When you memorize facts", "When you finish quickly"],
      correctAnswer: "When you can explain it to others"
    }
  ];
  
  // Hardcoded animations for guaranteed rendering
  const initHardcodedAnimations = (count) => {
    return Array.from({ length: count }, () => ({
      opacity: new Animated.Value(1),
      scale: new Animated.Value(1),
      transition: new Animated.Value(0)
    }));
  };
  
  // Create a compatible module structure with guaranteed content
  const compatibleModule = {
    id: currentModule?.order || '1',
    title: currentModule?.title || "Fun Learning Module",
    description: currentModule?.description || "Explore this exciting learning module!",
    topic: currentModule?.topic || currentModule?.title || "General Learning",
    difficulty: 'medium', // Default difficulty
    
    // Ensure we always have data by using hardcoded content
    lessons: HARDCODED_LESSONS,
    quizzes: HARDCODED_QUIZZES
  };
  
  console.log("Module selected:", currentModule?.title);
  console.log("Compatible module created:", compatibleModule.title);
  console.log("FORCED LESSONS COUNT:", compatibleModule.lessons.length);
  console.log("FORCED QUIZZES COUNT:", compatibleModule.quizzes.length);
  
  // Get topic color from the map or default
  const topicColor = topicColorMap[currentModule?.topic || currentModule?.title] || "#FF6F00";
  
  // Initialize animations when component mounts
  useEffect(() => {
    // Initialize animations with hardcoded data
    setLessonAnimations(initHardcodedAnimations(HARDCODED_LESSONS.length));
    setQuizAnimations(initHardcodedAnimations(HARDCODED_QUIZZES.length));
    
    console.log("FORCED LESSONS ANIMATIONS:", HARDCODED_LESSONS.length);
    console.log("FORCED QUIZZES ANIMATIONS:", HARDCODED_QUIZZES.length);
  }, []);
  
  // Helper function to get appropriate icon for lesson
  const getIconForLesson = (title = "") => {
    const titleLower = (title || "").toLowerCase();
    
    if (titleLower.includes('animal')) return 'paw';
    if (titleLower.includes('family')) return 'account-group';
    if (titleLower.includes('school')) return 'school';
    if (titleLower.includes('community')) return 'home-city';
    if (titleLower.includes('environment')) return 'tree';
    if (titleLower.includes('nature')) return 'leaf';
    if (titleLower.includes('transport')) return 'car';
    if (titleLower.includes('communication')) return 'phone';
    if (titleLower.includes('time')) return 'clock';
    if (titleLower.includes('festival')) return 'party-popper';
    if (titleLower.includes('habit')) return 'heart-pulse';
    if (titleLower.includes('citizen')) return 'flag';
    
    return 'book-open-page-variant'; // Default icon
  };
  
  // Add state for quiz answers and quiz selection
  const [quizAnswers, setQuizAnswers] = useState<(string | null)[]>(
    Array(HARDCODED_QUIZZES.length).fill(null)
  );
  
  // Function to handle lesson start
  const handleLessonStart = (lesson: any) => {
    console.log("Starting lesson:", lesson.title);
    // In a real app, you would navigate to a lesson screen or display content
    Alert.alert("Lesson Started", `You are starting: ${lesson.title}`);
  };
  
  // Function to handle quiz answer selection
  const handleQuizAnswer = (quizIndex: number, selectedOption: string) => {
    console.log(`Quiz ${quizIndex}: Selected ${selectedOption}`);
    const newAnswers = [...quizAnswers];
    newAnswers[quizIndex] = selectedOption;
    setQuizAnswers(newAnswers);
  };
  
  // Function to handle quiz submission
  const handleSubmitQuiz = (quiz: any, quizIndex: number) => {
    console.log("Submitting quiz:", quiz.title);
    const selectedAnswer = quizAnswers[quizIndex];
    const isCorrect = selectedAnswer === quiz.correctAnswer;
    
    Alert.alert(
      isCorrect ? "Correct! 🎉" : "Try Again 🤔",
      isCorrect 
        ? `Great job! "${selectedAnswer}" is the correct answer.` 
        : `The correct answer was "${quiz.correctAnswer}". Keep learning!`,
      [{ text: "OK", onPress: () => {
        // Reset the answer for this quiz after submission
        const newAnswers = [...quizAnswers];
        newAnswers[quizIndex] = null;
        setQuizAnswers(newAnswers);
      }}]
    );
  };
  
  // Rainbow colors for kid-friendly UI
  const colors = ['#FF9800', '#4CAF50', '#2196F3', '#9C27B0', '#F44336', '#009688'];
  
  // Render super fun lesson card
  const renderLessonCard = (lesson, index) => {
    console.log(`Rendering lesson ${index}:`, lesson);
    
    // Ensure we have valid properties
    const lessonTitle = lesson?.title || `Lesson ${index + 1}`;
    const lessonDescription = lesson?.description || lesson?.content || "Fun lesson content";
    
    return (
      <Animated.View 
        key={`lesson-${index}`}
        style={[
          styles.lessonCard,
          {
            transform: [
              { translateY: lessonAnimations[index]?.transition || 0 },
              { scale: lessonAnimations[index]?.scale || 1 }
            ],
            opacity: lessonAnimations[index]?.opacity || 1,
            borderColor: `${topicColor}33`, // 20% opacity
            backgroundColor: '#FFFFFF',
            marginBottom: 16,
            borderRadius: 15,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
            borderWidth: 1
          }
        ]}
      >
        <View style={{
          flexDirection: 'row', 
          padding: 15,
          alignItems: 'center'
        }}>
          <View style={[
            styles.lessonIconContainer, 
            { 
              backgroundColor: `${topicColor}15`,
              width: 50,
              height: 50,
              borderRadius: 25,
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: 12
            }
          ]}>
            <MaterialCommunityIcons 
              name={getIconForLesson(lessonTitle)} 
              size={32} 
              color={topicColor} 
            />
          </View>
          <View style={{
            flex: 1
          }}>
            <Text style={{
              fontSize: 16,
              fontWeight: 'bold',
              color: '#333333',
              marginBottom: 4
            }}>{lessonTitle}</Text>
            <Text style={{
              fontSize: 14,
              color: '#666666',
              marginBottom: 10
            }} numberOfLines={2}>{lessonDescription}</Text>
            <TouchableOpacity 
              style={{
                paddingHorizontal: 15,
                paddingVertical: 8,
                borderRadius: 20,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: topicColor,
                alignSelf: 'flex-start'
              }}
              onPress={() => handleLessonStart(lesson)}
            >
              <Text style={{
                color: '#FFFFFF',
                fontWeight: 'bold',
                fontSize: 14
              }}>Start</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    );
  };
  
  // Render super fun quiz card
  const renderQuizCard = (quiz, index) => {
    console.log(`Rendering quiz ${index}:`, quiz);
    
    // Ensure we have valid properties
    const quizTitle = quiz?.title || quiz?.question || `Fun Quiz ${index + 1}`;
    
    return (
      <Animated.View 
        key={`quiz-${index}`}
        style={[
          styles.quizCard,
          {
            transform: [
              { translateY: quizAnimations[index]?.transition || 0 },
              { scale: quizAnimations[index]?.scale || 1 }
            ],
            opacity: quizAnimations[index]?.opacity || 1,
            borderColor: `${topicColor}33`, // 20% opacity
            backgroundColor: '#FFFFFF',
            marginBottom: 16,
            borderRadius: 15,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
            borderWidth: 1
          }
        ]}
      >
        <View style={{
          padding: 15
        }}>
          <Text style={{
            fontSize: 16,
            fontWeight: 'bold',
            color: '#333333',
            marginBottom: 12
          }}>
            {quizTitle}
          </Text>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 10,
            paddingVertical: 5,
            borderRadius: 15,
            alignSelf: 'flex-start',
            marginBottom: 10,
            borderWidth: 1,
            backgroundColor: `${topicColor}20`, 
            borderColor: `${topicColor}40`
          }}>
            <MaterialCommunityIcons 
              name={'brain'} 
              size={16} 
              color={topicColor} 
            />
            <Text style={{
              fontSize: 12,
              marginLeft: 4,
              fontWeight: '500',
              color: topicColor
            }}>
              Quiz Challenge
            </Text>
          </View>
          
          <TouchableOpacity 
            style={{
              paddingHorizontal: 15,
              paddingVertical: 10,
              borderRadius: 20,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: topicColor,
              alignSelf: 'flex-start'
            }}
            onPress={() => handleSubmitQuiz(quiz, index)}
          >
            <Text style={{
              color: '#FFFFFF',
              fontWeight: 'bold',
              fontSize: 14
            }}>Take Quiz</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };
  
  // Log all available module titles and topics for debugging
  useEffect(() => {
    console.log("=== AVAILABLE MODULES ===");
    moduleData.forEach((module, index) => {
      console.log(`${index}: Title: "${module.title}", Topic: "${module.topic}"`);
    });
    console.log("=========================");
  }, []);
  
  // Add comprehensive logging at component load
  useEffect(() => {
    console.log("===== COMPONENT INITIALIZATION =====");
    console.log("Module data array length:", moduleData.length);
    console.log("Route params:", JSON.stringify(route.params));
    console.log("Selected subject name:", selectedSubject.subjectName);
    console.log("HARDCODED_LESSONS count:", HARDCODED_LESSONS.length);
    console.log("HARDCODED_QUIZZES count:", HARDCODED_QUIZZES.length);
    console.log("Component mount rendering with hardcoded data");
    
    // Log component tree structure
    console.log("Component structure:");
    console.log("- SafeAreaView");
    console.log("  - HeaderBackground");
    console.log("  - ScrollView");
    console.log("    - Header (Animated)");
    console.log("    - Content container");
    console.log("      - Lessons section");
    console.log("        - Lesson cards:", HARDCODED_LESSONS.length);
    console.log("      - Quizzes section");
    console.log("        - Quiz cards:", HARDCODED_QUIZZES.length);
    
    console.log("=================================");
  }, []);
  
  // More detailed debug for quiz answers
  useEffect(() => {
    console.log("Quiz answers updated:", JSON.stringify(quizAnswers));
  }, [quizAnswers]);
  
  // Add debugging info to render
  console.log("RENDER: KidsFriendlySubjectScreen rendering with:");
  console.log("- Topic color:", topicColor);
  console.log("- Lesson count:", HARDCODED_LESSONS.length);
  console.log("- Quiz count:", HARDCODED_QUIZZES.length);
  
  // Super fun loading screen for kids
  if (false) { // Show the actual UI instead of loading screen
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#FF6F00" />
          
          <Animated.View style={{ 
            transform: [{ translateY: bounce }],
            marginVertical: 15
          }}>
            <MaterialCommunityIcons 
              name="robot-excited" 
              size={100} 
              color="#FF6F00" 
            />
          </Animated.View>
          
          <Text style={styles.loadingTitle}>
            Preparing Fun and Games!
          </Text>
          
          <Text style={styles.loadingSubtext}>
            Your amazing adventure is about to begin...
          </Text>
          
          {/* Animation dots for kids */}
          <View style={styles.loadingDotsContainer}>
            {['#FF4081', '#3F51B5', '#FF9800', '#4CAF50', '#9C27B0'].map((color, i) => (
              <View 
                key={i}
                style={[styles.loadingDot, { backgroundColor: color }]}
              />
            ))}
          </View>
        </View>
      </SafeAreaView>
    );
  }
  
  // Ensure rendering: Create a safety function to guarantee content
  useEffect(() => {
    // Force a re-render after a short delay to ensure components have mounted properly
    const timer = setTimeout(() => {
      console.log("🔄 FORCED RE-RENDER SAFETY CHECK");
      console.log("Module data loaded:", moduleData ? "Yes" : "No");
      console.log("Compatible module created:", compatibleModule ? "Yes" : "No");
      console.log("Hardcoded lessons ready:", HARDCODED_LESSONS ? "Yes" : "No");
      console.log("Hardcoded quizzes ready:", HARDCODED_QUIZZES ? "Yes" : "No");
      
      // Force a re-render by creating a new animation value
      const refreshedFadeAnim = new Animated.Value(1);
      setFadeAnim(refreshedFadeAnim);
      
      // Start a simple animation to ensure UI updates
      Animated.timing(refreshedFadeAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true
      }).start();
      
      // Check if we have appropriate animations
      if (lessonAnimations.length !== HARDCODED_LESSONS.length) {
        console.log("⚠️ Lesson animations count mismatch, fixing...");
        setLessonAnimations(initHardcodedAnimations(HARDCODED_LESSONS.length));
      }
      
      if (quizAnimations.length !== HARDCODED_QUIZZES.length) {
        console.log("⚠️ Quiz animations count mismatch, fixing...");
        setQuizAnimations(initHardcodedAnimations(HARDCODED_QUIZZES.length));
      }
      
      console.log("🛡️ Safety check complete");
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Add navigation title update
  useEffect(() => {
    if (navigation.setOptions) {
      navigation.setOptions({
        title: selectedSubject.subjectName || 'Learning Module',
        headerStyle: {
          backgroundColor: topicColor,
        },
        headerTintColor: 'white',
      });
    }
  }, [navigation, selectedSubject, topicColor]);
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.container}>
        {/* Fun Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color={topicColor} />
          </TouchableOpacity>
          
          <Animated.View style={{ 
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }]
          }}>
            <Text style={[styles.headerTitle, { color: topicColor }]}>
              {compatibleModule.title}
            </Text>
          </Animated.View>
        </View>
        
        {/* Content Area */}
        <ScrollView 
          style={styles.contentScrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Section with Fun Details */}
          <Animated.View 
            style={[
              styles.heroSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
                borderColor: topicColor
              }
            ]}
          >
            <View style={styles.heroContent}>
              <View style={[styles.iconCircle, { backgroundColor: topicColor }]}>
                <Animated.View style={{ transform: [{ rotate: wobbleInterpolate }] }}>
                  <MaterialCommunityIcons 
                    name={getIconForLesson(compatibleModule.title)} 
                    size={60} 
                    color="#FFFFFF" 
                  />
                </Animated.View>
                
                {/* Spinning star decoration */}
                <Animated.View 
                  style={{
                    position: 'absolute',
                    top: -8,
                    right: -8,
                    transform: [{ rotate: rotateInterpolate }]
                  }}
                >
                  <MaterialCommunityIcons name="star" size={26} color="#FFD700" />
                </Animated.View>
                
                {/* Bouncing decoration */}
                <Animated.View 
                  style={{
                    position: 'absolute',
                    bottom: -8,
                    left: -8,
                    transform: [{ translateY: bounce }]
                  }}
                >
                  <MaterialCommunityIcons name="balloon" size={32} color="#FF4081" />
                </Animated.View>
              </View>
              
              <Text style={[styles.titleText, { color: topicColor }]}>{compatibleModule.title}</Text>
              
              <View style={[styles.categoryBadge, { backgroundColor: `${topicColor}22` }]}>
                <Text style={[styles.categoryText, { color: topicColor }]}>{compatibleModule.topic}</Text>
              </View>
              
              <View style={[styles.descriptionBox, { borderColor: `${topicColor}55` }]}>
                <Text style={styles.descriptionText}>
                  {compatibleModule.description}
                </Text>
              </View>
              
              <View style={[styles.difficultyBadge, { backgroundColor: `${topicColor}22`, borderColor: `${topicColor}55` }]}>
                <MaterialCommunityIcons 
                  name="signal-variant" 
                  size={24} 
                  color={topicColor} 
                />
                <Text style={[styles.difficultyText, { color: topicColor }]}>
                  Difficulty: <Text style={{ textTransform: 'capitalize' }}>{compatibleModule.difficulty}</Text>
                </Text>
              </View>
            </View>
          </Animated.View>
          
          {/* Replace the tabs section with a direct rendering approach */}
          <View style={styles.contentContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Lessons</Text>
            </View>
            
            {/* Directly render hardcoded lessons with inline styles */}
            <View style={{padding: 15}}>
              {HARDCODED_LESSONS.map((lesson, index) => (
                <TouchableOpacity 
                  key={lesson.id}
                  onPress={() => handleLessonStart(lesson)}
                  style={{
                    backgroundColor: 'white',
                    borderRadius: 16,
                    marginBottom: 15,
                    padding: 15,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 3,
                    flexDirection: 'row',
                    alignItems: 'center'
                  }}>
                  <View style={{
                    width: 50,
                    height: 50,
                    borderRadius: 25,
                    backgroundColor: `${topicColor}20`,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 15
                  }}>
                    <MaterialCommunityIcons 
                      name="book-open-variant" 
                      size={24} 
                      color={topicColor} 
                    />
                  </View>
                  <View style={{flex: 1}}>
                    <Text style={{
                      fontSize: 16,
                      fontWeight: 'bold',
                      marginBottom: 4,
                      color: '#333'
                    }}>{lesson.title}</Text>
                    <Text style={{
                      fontSize: 14,
                      color: '#666',
                      marginBottom: 10
                    }}>{lesson.description}</Text>
                    <TouchableOpacity
                      style={{
                        backgroundColor: topicColor,
                        paddingHorizontal: 15,
                        paddingVertical: 8,
                        borderRadius: 8,
                        alignSelf: 'flex-start'
                      }}
                      onPress={() => handleLessonStart(lesson)}>
                      <Text style={{color: 'white', fontWeight: 'bold'}}>Start</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
            
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Quizzes</Text>
            </View>
            
            {/* Directly render hardcoded quizzes with inline styles */}
            <View style={{padding: 15}}>
              {HARDCODED_QUIZZES.map((quiz, index) => (
                <View 
                  key={quiz.id}
                  style={{
                    backgroundColor: 'white',
                    borderRadius: 16,
                    marginBottom: 15,
                    padding: 15,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 3
                  }}>
                  <Text style={{
                    fontSize: 16,
                    fontWeight: 'bold',
                    marginBottom: 10,
                    color: '#333'
                  }}>{quiz.title}</Text>
                  <Text style={{
                    fontSize: 15,
                    color: '#444',
                    marginBottom: 15
                  }}>{quiz.question}</Text>
                  
                  <View style={{marginBottom: 15}}>
                    {quiz.options.map((option, optionIndex) => (
                      <TouchableOpacity
                        key={optionIndex}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          paddingVertical: 10,
                          paddingHorizontal: 15,
                          borderWidth: 1,
                          borderColor: '#ddd',
                          borderRadius: 8,
                          marginBottom: 8,
                          backgroundColor: quizAnswers[index] === option ? `${topicColor}20` : 'white'
                        }}
                        onPress={() => handleQuizAnswer(index, option)}>
                        <Text style={{
                          fontSize: 14,
                          color: quizAnswers[index] === option ? topicColor : '#555'
                        }}>{option}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  
                  <TouchableOpacity
                    style={{
                      backgroundColor: quizAnswers[index] ? topicColor : '#ccc',
                      paddingVertical: 12,
                      borderRadius: 8,
                      alignItems: 'center'
                    }}
                    disabled={!quizAnswers[index]}
                    onPress={() => handleSubmitQuiz(quiz, index)}>
                      <Text style={{color: 'white', fontWeight: 'bold'}}>Submit Answer</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
          
          {/* Decorative elements */}
          <Animated.View 
            style={[
              styles.cloudDecoration,
              { transform: [{ translateY: bounce }] }
            ]}
          >
            <MaterialCommunityIcons name="cloud" size={40} color="#BBDEFB" />
          </Animated.View>
          
          <Animated.View 
            style={[
              styles.sunDecoration,
              { transform: [{ rotate: rotateInterpolate }] }
            ]}
          >
            <MaterialCommunityIcons name="weather-sunny" size={40} color="#FFEB3B" />
          </Animated.View>
          
          <View style={styles.spacer} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1, 
    backgroundColor: '#FFEBEE'
  },
  container: {
    flex: 1,
  },
  // Header styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: '#FFE0B2',
    borderBottomWidth: 3,
    borderBottomColor: '#FFCC80',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 4,
  },
  backButton: {
    backgroundColor: '#FFFFFF',
    padding: 8,
    borderRadius: 20,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6F00',
    marginLeft: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  
  // Hero section styles
  heroSection: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    margin: 15,
    borderRadius: 25,
    borderWidth: 3,
    borderColor: '#FF9800',
    elevation: 5,
  },
  heroContent: {
    alignItems: 'center',
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  titleText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF6F00',
    textAlign: 'center',
    marginVertical: 10,
  },
  categoryBadge: {
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: '#E1F5FE',
    marginVertical: 8,
  },
  categoryText: {
    color: '#0288D1',
    fontWeight: 'bold',
    fontSize: 16,
  },
  descriptionBox: {
    backgroundColor: '#FFF8E1',
    padding: 15,
    borderRadius: 15,
    marginVertical: 10,
    borderWidth: 2,
    borderColor: '#FFECB3',
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#5D4037',
    textAlign: 'center',
  },
  difficultyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 20,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  difficultyText: {
    color: '#388E3C',
    fontWeight: 'bold',
    marginLeft: 5,
    fontSize: 16,
  },
  
  // Content area styles
  contentScrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 15,
    paddingBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 20,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#FFCC80',
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6F00',
  },
  
  // Lesson card styles
  lessonCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    overflow: 'hidden',
  },
  lessonIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginLeft: 15,
  },
  lessonContent: {
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  lessonTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
    flex: 1,
  },
  lessonDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 10,
    flex: 1,
  },
  startButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  
  // Quiz card styles
  quizCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    overflow: 'hidden',
  },
  quizContent: {
    padding: 15,
  },
  quizQuestion: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
  },
  quizSubmitButton: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quizSubmitText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  
  // Quiz info card
  quizInfoCard: {
    backgroundColor: '#FFF9C4',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF59D',
    elevation: 3,
  },
  quizInfoText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#5D4037',
  },
  
  // Quiz completion badge
  quizCompletionContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginTop: 20,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFD700',
    elevation: 5,
  },
  quizCompletionText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6F00',
    textAlign: 'center',
    marginBottom: 15,
  },
  
  // Loading animation
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
  },
  loadingBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFCCBC',
    elevation: 8,
    width: width * 0.85,
  },
  loadingTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6F00',
    marginVertical: 15,
    textAlign: 'center',
  },
  loadingSubtext: {
    fontSize: 16,
    color: '#5D4037',
    textAlign: 'center',
    marginBottom: 20,
  },
  loadingDotsContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },
  loadingDot: {
    width: 15,
    height: 15,
    borderRadius: 8,
    margin: 5,
  },
  
  // Decoration elements
  cloudDecoration: {
    position: 'absolute',
    right: 20,
    top: 20,
  },
  sunDecoration: {
    position: 'absolute',
    left: 20,
    top: 100,
  },
  spacer: {
    height: 30,
  },
  emptyQuizzesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyQuizzesText: {
    fontSize: 16,
    color: '#5D4037',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default KidsFriendlySubjectScreen; 