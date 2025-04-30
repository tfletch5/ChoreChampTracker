import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Initial state
const initialState = {
  rewards: {},
  redemptions: {},
  loading: false,
  error: null,
};

// Async thunks for API calls - to be implemented with backend
export const fetchRewards = createAsyncThunk(
  'rewards/fetchRewards',
  async (parentId, { rejectWithValue }) => {
    try {
      // For now, just return mock data
      return {
        '1': {
          id: '1',
          title: 'Ice cream',
          description: 'A delicious treat!',
          pointCost: 30,
          isCashReward: false,
          isAvailable: true,
          createdBy: 'parent1',
          createdAt: Date.now() - 2592000000, // 30 days ago
          updatedAt: Date.now() - 2592000000,
        },
        '2': {
          id: '2',
          title: 'Movie night',
          description: 'Pick any movie to watch',
          pointCost: 50,
          isCashReward: false,
          isAvailable: true,
          createdBy: 'parent1',
          createdAt: Date.now() - 2592000000,
          updatedAt: Date.now() - 2592000000,
        },
        '3': {
          id: '3',
          title: 'Video game time (1 hour)',
          description: 'Extra gaming time',
          pointCost: 40,
          isCashReward: false,
          isAvailable: true,
          createdBy: 'parent1',
          createdAt: Date.now() - 2592000000,
          updatedAt: Date.now() - 2592000000,
        },
        '4': {
          id: '4',
          title: '$5 Cash',
          description: 'Cash reward',
          pointCost: 100,
          isCashReward: true,
          cashValue: 500, // in cents
          isAvailable: true,
          createdBy: 'parent1',
          createdAt: Date.now() - 2592000000,
          updatedAt: Date.now() - 2592000000,
        },
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchRedemptions = createAsyncThunk(
  'rewards/fetchRedemptions',
  async (childId, { rejectWithValue }) => {
    try {
      // For now, just return mock data
      return {
        '1': {
          id: '1',
          rewardId: '1',
          childId: '1',
          pointsSpent: 30,
          status: 'approved',
          redeemedAt: Date.now() - 604800000, // 1 week ago
          processedAt: Date.now() - 604000000,
        },
        '2': {
          id: '2',
          rewardId: '3',
          childId: '2',
          pointsSpent: 40,
          status: 'pending',
          redeemedAt: Date.now() - 86400000, // 1 day ago
        },
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addReward = createAsyncThunk(
  'rewards/addReward',
  async (rewardData, { rejectWithValue }) => {
    try {
      // Simulate API call
      const newReward = {
        ...rewardData,
        id: Math.random().toString(36).substr(2, 9),
        isAvailable: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      
      return newReward;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateReward = createAsyncThunk(
  'rewards/updateReward',
  async ({ rewardId, updates }, { rejectWithValue }) => {
    try {
      // Simulate API call
      return {
        id: rewardId,
        ...updates,
        updatedAt: Date.now(),
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteReward = createAsyncThunk(
  'rewards/deleteReward',
  async (rewardId, { rejectWithValue }) => {
    try {
      // Simulate API call
      return rewardId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const redeemReward = createAsyncThunk(
  'rewards/redeemReward',
  async ({ childId, rewardId }, { getState, rejectWithValue }) => {
    try {
      // Get the reward and child details
      const state = getState();
      const reward = state.rewards.rewards[rewardId];
      
      if (!reward) {
        return rejectWithValue('Reward not found');
      }
      
      // Create a new redemption
      const redemption = {
        id: Math.random().toString(36).substr(2, 9),
        rewardId,
        childId,
        pointsSpent: reward.pointCost,
        cashValue: reward.cashValue,
        status: 'pending',
        redeemedAt: Date.now(),
      };
      
      return redemption;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const processRedemption = createAsyncThunk(
  'rewards/processRedemption',
  async ({ redemptionId, approved }, { rejectWithValue }) => {
    try {
      // Simulate API call
      return {
        id: redemptionId,
        status: approved ? 'approved' : 'denied',
        processedAt: Date.now(),
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Rewards slice
const rewardsSlice = createSlice({
  name: 'rewards',
  initialState,
  reducers: {
    resetRewardsState: (state) => {
      state.rewards = {};
      state.redemptions = {};
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch rewards
      .addCase(fetchRewards.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRewards.fulfilled, (state, action) => {
        state.rewards = action.payload;
        state.loading = false;
      })
      .addCase(fetchRewards.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch redemptions
      .addCase(fetchRedemptions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRedemptions.fulfilled, (state, action) => {
        state.redemptions = action.payload;
        state.loading = false;
      })
      .addCase(fetchRedemptions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Add reward
      .addCase(addReward.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addReward.fulfilled, (state, action) => {
        state.rewards[action.payload.id] = action.payload;
        state.loading = false;
      })
      .addCase(addReward.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update reward
      .addCase(updateReward.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateReward.fulfilled, (state, action) => {
        const { id, ...updates } = action.payload;
        if (state.rewards[id]) {
          state.rewards[id] = { ...state.rewards[id], ...updates };
        }
        state.loading = false;
      })
      .addCase(updateReward.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete reward
      .addCase(deleteReward.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteReward.fulfilled, (state, action) => {
        delete state.rewards[action.payload];
        state.loading = false;
      })
      .addCase(deleteReward.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Redeem reward
      .addCase(redeemReward.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(redeemReward.fulfilled, (state, action) => {
        state.redemptions[action.payload.id] = action.payload;
        state.loading = false;
      })
      .addCase(redeemReward.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Process redemption
      .addCase(processRedemption.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(processRedemption.fulfilled, (state, action) => {
        const { id, ...updates } = action.payload;
        if (state.redemptions[id]) {
          state.redemptions[id] = { ...state.redemptions[id], ...updates };
        }
        state.loading = false;
      })
      .addCase(processRedemption.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetRewardsState } = rewardsSlice.actions;
export default rewardsSlice.reducer;