import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import choresReducer from './slices/choresSlice';
import childrenReducer from './slices/childrenSlice';
import rewardsReducer from './slices/rewardsSlice';
import walletReducer from './slices/walletSlice';
import analyticsReducer from './slices/analyticsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    chores: choresReducer,
    children: childrenReducer,
    rewards: rewardsReducer,
    wallet: walletReducer,
    analytics: analyticsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;