import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import subjectsReducer from './slices/subjectsSlice';
import modulesReducer from './slices/modulesSlice';
import quizReducer from './slices/quizSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    subjects: subjectsReducer,
    modules: modulesReducer,
    quiz: quizReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export { store };