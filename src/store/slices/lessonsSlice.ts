import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { lessonService, LessonDetail } from '../../services';

interface LessonsState {
  currentLesson: LessonDetail | null;
  loading: boolean;
  error: string | null;
}

const initialState: LessonsState = {
  currentLesson: null,
  loading: false,
  error: null,
};

export const fetchLessonDetail = createAsyncThunk(
  'lessons/fetchLessonDetail',
  async (lessonId: string, { rejectWithValue }) => {
    try {
      const response = await lessonService.getLessonDetail(lessonId);
      return response;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to fetch lesson detail');
    }
  }
);

const lessonsSlice = createSlice({
  name: 'lessons',
  initialState,
  reducers: {
    clearCurrentLesson: (state) => {
      state.currentLesson = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLessonDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLessonDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.currentLesson = action.payload;
      })
      .addCase(fetchLessonDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// Selectors
export const selectCurrentLesson = (state: RootState) => state.lessons.currentLesson;
export const selectLessonsLoading = (state: RootState) => state.lessons.loading;
export const selectLessonsError = (state: RootState) => state.lessons.error;

export const { clearCurrentLesson } = lessonsSlice.actions;

export default lessonsSlice.reducer; 