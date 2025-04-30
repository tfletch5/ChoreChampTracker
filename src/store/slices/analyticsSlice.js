import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Initial state for analytics
const initialState = {
  childAnalytics: {},
  loading: false,
  error: null,
};

// Sample analytics for demo purposes
const sampleAnalytics = {
  'child123': {
    childId: 'child123',
    completedChores: 32,
    totalPoints: 215,
    currentStreak: 3,
    longestStreak: 5,
    completionRate: 87, // percentage
    averageTimeToComplete: 12, // in hours
    lastUpdated: Date.now(),
  },
  'child456': {
    childId: 'child456',
    completedChores: 18,
    totalPoints: 120,
    currentStreak: 2,
    longestStreak: 4,
    completionRate: 75, // percentage
    averageTimeToComplete: 18, // in hours
    lastUpdated: Date.now(),
  }
};

// Analytics thunks
export const fetchChildAnalytics = createAsyncThunk(
  'analytics/fetchChildAnalytics',
  async (childId, { rejectWithValue }) => {
    try {
      // In a real app, fetch from Firebase
      // For now, use sample data
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (childId) {
        return { [childId]: sampleAnalytics[childId] };
      }
      
      return sampleAnalytics;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch analytics');
    }
  }
);

export const generateAnalyticsReport = createAsyncThunk(
  'analytics/generateReport',
  async ({ childId, type, dateRange }, { rejectWithValue, getState }) => {
    try {
      // This would be a more complex calculation in a real app, 
      // potentially aggregating data from multiple sources
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const { childAnalytics } = getState().analytics;
      
      if (!childAnalytics[childId]) {
        return rejectWithValue('Child analytics not found');
      }
      
      // Just return the existing analytics data for now
      return childAnalytics[childId];
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to generate report');
    }
  }
);

// Analytics slice
const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    resetAnalyticsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Child Analytics
      .addCase(fetchChildAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChildAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.childAnalytics = {
          ...state.childAnalytics,
          ...action.payload
        };
      })
      .addCase(fetchChildAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch analytics';
      })
      // Generate Report
      .addCase(generateAnalyticsReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(generateAnalyticsReport.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(generateAnalyticsReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to generate report';
      });
  },
});

export const { resetAnalyticsError } = analyticsSlice.actions;

export default analyticsSlice.reducer;