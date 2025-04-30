import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import choresReducer from './slices/choresSlice';
import childrenReducer from './slices/childrenSlice';
import rewardsReducer from './slices/rewardsSlice';
import walletReducer from './slices/walletSlice';
import analyticsReducer from './slices/analyticsSlice';

// Configure the Redux store
const store = configureStore({
  reducer: {
    auth: authReducer,
    chores: choresReducer,
    children: childrenReducer,
    rewards: rewardsReducer,
    wallet: walletReducer,
    analytics: analyticsReducer,
  },
  // Add middleware if needed
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({
    serializableCheck: {
      // Ignore these action types (if needed)
      ignoredActions: [],
      // Ignore these field paths (if needed)
      ignoredPaths: [],
    },
  }),
});

export default store;