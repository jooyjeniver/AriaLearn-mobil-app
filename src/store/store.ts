import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import subjectsReducer from './slices/subjectsSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    subjects: subjectsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export { store };