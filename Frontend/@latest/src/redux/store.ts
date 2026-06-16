import { configureStore } from '@reduxjs/toolkit';
import insightsReducer from './slices/insightsSlice';
import modalsReducer from './slices/modalsSlice';

export const store = configureStore({
  reducer: {
    insights: insightsReducer,
    modals: modalsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
