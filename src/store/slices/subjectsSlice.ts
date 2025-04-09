import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';
import { API_CONFIG } from '../../config/api';

interface Subject {
  _id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  order: number;
  modules: any[];
  createdAt: string;
}

interface SubjectsState {
  items: Subject[];
  loading: boolean;
  error: string | null;
}

// Default subjects data
const defaultSubjects: Subject[] = [
  {
    _id: '1',
    name: 'Myself and My Family',
    description: 'Learn about personal identity, family relationships, and responsibilities at home',
    icon: 'account-group',
    color: '#FF4F9A',
    order: 1,
    modules: [],
    createdAt: new Date().toISOString()
  },
  {
    _id: '2',
    name: 'Our School and Community',
    description: 'Explore school life, community helpers, and important places in our neighborhood',
    icon: 'school',
    color: '#4F7CFF',
    order: 2,
    modules: [],
    createdAt: new Date().toISOString()
  },
  {
    _id: '3',
    name: 'Good Habits and Citizenship',
    description: 'Develop good habits and learn about being a responsible citizen',
    icon: 'hand-heart',
    color: '#00C48C',
    order: 3,
    modules: [],
    createdAt: new Date().toISOString()
  },
  {
    _id: '4',
    name: 'My Environment',
    description: 'Discover the natural world and learn about environmental care',
    icon: 'nature',
    color: '#FFB800',
    order: 4,
    modules: [],
    createdAt: new Date().toISOString()
  },
  {
    _id: '5',
    name: 'Time and History',
    description: 'Understand concepts of time and explore historical events',
    icon: 'clock-time-four',
    color: '#BC4FFF',
    order: 5,
    modules: [],
    createdAt: new Date().toISOString()
  },
  {
    _id: '6',
    name: 'Transport and Communication',
    description: 'Learn about different modes of transport and ways of communication',
    icon: 'bus-multiple',
    color: '#FF8A4F',
    order: 6,
    modules: [],
    createdAt: new Date().toISOString()
  }
];

const initialState: SubjectsState = {
  items: defaultSubjects, // Use default subjects initially
  loading: false,
  error: null,
};

export const fetchSubjects = createAsyncThunk(
  'subjects/fetchSubjects',
  async () => {
    try {
      console.log('Fetching subjects...');
      const response = await api.get(API_CONFIG.ENDPOINTS.SUBJECTS);
      console.log('Subjects response:', response.data);
      return response.data.data; // Extract the subjects array from the response
    } catch (error: any) {
      console.error('Error fetching subjects:', error);
      // Return default subjects if API call fails
      return defaultSubjects;
    }
  }
);

const subjectsSlice = createSlice({
  name: 'subjects',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubjects.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.error = null;
      })
      .addCase(fetchSubjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch subjects';
        // Keep using default subjects if API fails
        state.items = defaultSubjects;
      });
  },
});

export default subjectsSlice.reducer;