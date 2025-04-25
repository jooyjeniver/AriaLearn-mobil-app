import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import subjectsReducer from './slices/subjectsSlice';
import modulesReducer from './slices/modulesSlice';
import arModelsReducer from './slices/arModelsSlice';
import emotionReducer from './slices/emotionSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    subjects: subjectsReducer,
    modules: modulesReducer,
    arModels: arModelsReducer,
    emotion: emotionReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;