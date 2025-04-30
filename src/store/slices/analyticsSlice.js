import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Initial state
const initialState = {
  childAnalytics: {},
  loading: false,
  error: null,
};

// Async thunks for API calls - to be implemented with backend
export const fetchChildAnalytics = createAsyncThunk(
  'analytics/fetchChildAnalytics',
  async (childId, { rejectWithValue }) => {
    try {
      // For now, just return mock data
      // In a real app, this would calculate analytics based on chore data
      
      // If childId is provided, return analytics for just that child
      if (childId) {
        return {
          [childId]: {
            childId,
            completedChores: 18,
            totalPoints: 325,
            currentStreak: 3,
            longestStreak: 7,
            completionRate: 0.85, // 85%
            averageTimeToComplete: 12, // 12 hours
            lastUpdated: Date.now(),
          }
        };
      }
      
      // Otherwise return analytics for all children
      return {
        '1': {
          childId: '1',
          completedChores: 18,
          totalPoints: 325,
          currentStreak: 3,
          longestStreak: 7,
          completionRate: 0.85, // 85%
          averageTimeToComplete: 12, // 12 hours
          lastUpdated: Date.now(),
        },
        '2': {
          childId: '2',
          completedChores: 24,
          totalPoints: 410,
          currentStreak: 5,
          longestStreak: 10,
          completionRate: 0.92, // 92%
          averageTimeToComplete: 8, // 8 hours
          lastUpdated: Date.now(),
        },
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateChildAnalytics = createAsyncThunk(
  'analytics/updateChildAnalytics',
  async ({ childId, updates }, { rejectWithValue }) => {
    try {
      // Simulate API call
      return {
        childId,
        ...updates,
        lastUpdated: Date.now(),
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const calculateChildAnalytics = createAsyncThunk(
  'analytics/calculateChildAnalytics',
  async (childId, { getState, rejectWithValue }) => {
    try {
      // In a real app, this would perform complex calculations based on chore history
      // For now, just return mock data
      const state = getState();
      const chores = state.chores.chores;
      
      // Mock calculation based on chore data
      const completedChores = Object.values(chores).filter(
        chore => chore.assignedTo === childId && chore.status === 'completed'
      ).length;
      
      const totalChores = Object.values(chores).filter(
        chore => chore.assignedTo === childId
      ).length;
      
      const completionRate = totalChores > 0 ? completedChores / totalChores : 0;
      
      // Get total points from completed chores
      const totalPoints = Object.values(chores)
        .filter(chore => chore.assignedTo === childId && chore.status === 'completed')
        .reduce((sum, chore) => sum + chore.pointValue, 0);
      
      // Mock streak calculation
      const currentStreak = childId === '1' ? 3 : 5;
      const longestStreak = childId === '1' ? 7 : 10;
      
      return {
        childId,
        completedChores,
        totalPoints,
        currentStreak,
        longestStreak,
        completionRate,
        averageTimeToComplete: childId === '1' ? 12 : 8, // Just mock data
        lastUpdated: Date.now(),
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Analytics slice
const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    resetAnalyticsState: (state) => {
      state.childAnalytics = {};
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch child analytics
      .addCase(fetchChildAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChildAnalytics.fulfilled, (state, action) => {
        state.childAnalytics = { ...state.childAnalytics, ...action.payload };
        state.loading = false;
      })
      .addCase(fetchChildAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update child analytics
      .addCase(updateChildAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateChildAnalytics.fulfilled, (state, action) => {
        const { childId, ...updates } = action.payload;
        if (state.childAnalytics[childId]) {
          state.childAnalytics[childId] = { ...state.childAnalytics[childId], ...updates };
        } else {
          state.childAnalytics[childId] = action.payload;
        }
        state.loading = false;
      })
      .addCase(updateChildAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Calculate child analytics
      .addCase(calculateChildAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(calculateChildAnalytics.fulfilled, (state, action) => {
        const { childId } = action.payload;
        state.childAnalytics[childId] = action.payload;
        state.loading = false;
      })
      .addCase(calculateChildAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetAnalyticsState } = analyticsSlice.actions;
export default analyticsSlice.reducer;