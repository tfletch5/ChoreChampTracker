import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Initial state for rewards
const initialState = {
  rewards: {},
  redemptions: {},
  loading: false,
  error: null,
};

// Sample rewards for demo purposes
const sampleRewards = {
  'reward1': {
    id: 'reward1',
    title: 'Movie Night',
    description: 'Choose a movie for the family to watch together',
    pointCost: 25,
    image: '🎬',
    isCashReward: false,
    isAvailable: true,
    createdBy: 'parent123',
    createdAt: Date.now() - 2592000000, // 30 days ago
    updatedAt: Date.now() - 2592000000,
  },
  'reward2': {
    id: 'reward2',
    title: '30 Minutes Extra Screen Time',
    description: 'Get an extra 30 minutes of screen time',
    pointCost: 15,
    image: '📱',
    isCashReward: false,
    isAvailable: true,
    createdBy: 'parent123',
    createdAt: Date.now() - 1728000000, // 20 days ago
    updatedAt: Date.now() - 1728000000,
  },
  'reward3': {
    id: 'reward3',
    title: 'Pizza Night',
    description: 'You get to choose the pizza toppings for dinner',
    pointCost: 30,
    image: '🍕',
    isCashReward: false,
    isAvailable: true,
    createdBy: 'parent123',
    createdAt: Date.now() - 864000000, // 10 days ago
    updatedAt: Date.now() - 864000000,
  },
  'reward4': {
    id: 'reward4',
    title: '$5 Allowance',
    description: 'Get $5 added to your allowance',
    pointCost: 50,
    image: '💵',
    isCashReward: true,
    cashValue: 500, // $5.00 in cents
    isAvailable: true,
    createdBy: 'parent123',
    createdAt: Date.now() - 432000000, // 5 days ago
    updatedAt: Date.now() - 432000000,
  },
  'reward5': {
    id: 'reward5',
    title: 'Stay Up Late',
    description: 'Stay up 1 hour past bedtime',
    pointCost: 20,
    image: '🌙',
    isCashReward: false,
    isAvailable: true,
    createdBy: 'parent123',
    createdAt: Date.now() - 172800000, // 2 days ago
    updatedAt: Date.now() - 172800000,
  },
};

// Sample redemptions
const sampleRedemptions = {
  'redemption1': {
    id: 'redemption1',
    rewardId: 'reward2',
    childId: 'child123',
    pointsSpent: 15,
    status: 'approved',
    redeemedAt: Date.now() - 259200000, // 3 days ago
    processedAt: Date.now() - 172800000, // 2 days ago
  },
  'redemption2': {
    id: 'redemption2',
    rewardId: 'reward4',
    childId: 'child123',
    pointsSpent: 50,
    cashValue: 500, // $5.00 in cents
    status: 'pending',
    redeemedAt: Date.now() - 43200000, // 12 hours ago
  },
};

// Rewards thunks
export const fetchRewards = createAsyncThunk(
  'rewards/fetchRewards',
  async (_, { rejectWithValue }) => {
    try {
      // In a real app, fetch from Firebase
      // For now, use sample data
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return sampleRewards;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch rewards');
    }
  }
);

export const fetchRedemptions = createAsyncThunk(
  'rewards/fetchRedemptions',
  async ({ childId, parentId }, { rejectWithValue }) => {
    try {
      // In a real app, fetch from Firebase based on childId or parentId
      // For now, use sample data
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return sampleRedemptions;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch redemptions');
    }
  }
);

export const addReward = createAsyncThunk(
  'rewards/addReward',
  async (rewardData, { rejectWithValue }) => {
    try {
      // In a real app, add to Firebase
      // For now, just simulate
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newReward = {
        ...rewardData,
        id: 'reward_' + Math.random().toString(36).substr(2, 9),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      
      return newReward;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to add reward');
    }
  }
);

export const redeemReward = createAsyncThunk(
  'rewards/redeemReward',
  async ({ rewardId, childId }, { rejectWithValue, getState }) => {
    try {
      const { rewards } = getState().rewards;
      const { children } = getState().children;
      
      if (!rewards[rewardId]) {
        return rejectWithValue('Reward not found');
      }
      
      if (!children[childId]) {
        return rejectWithValue('Child not found');
      }
      
      const reward = rewards[rewardId];
      const child = children[childId];
      
      if (child.points < reward.pointCost) {
        return rejectWithValue('Not enough points to redeem this reward');
      }
      
      // In a real app, add redemption to Firebase and update child points
      // For now, just simulate
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const redemption = {
        id: 'redemption_' + Math.random().toString(36).substr(2, 9),
        rewardId,
        childId,
        pointsSpent: reward.pointCost,
        cashValue: reward.cashValue,
        status: 'pending',
        redeemedAt: Date.now(),
      };
      
      return redemption;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to redeem reward');
    }
  }
);

export const processRedemption = createAsyncThunk(
  'rewards/processRedemption',
  async ({ redemptionId, approved }, { rejectWithValue, getState }) => {
    try {
      const { redemptions } = getState().rewards;
      
      if (!redemptions[redemptionId]) {
        return rejectWithValue('Redemption not found');
      }
      
      // In a real app, update redemption in Firebase
      // For now, just simulate
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedRedemption = {
        ...redemptions[redemptionId],
        status: approved ? 'approved' : 'denied',
        processedAt: Date.now(),
      };
      
      return updatedRedemption;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to process redemption');
    }
  }
);

// Rewards slice
const rewardsSlice = createSlice({
  name: 'rewards',
  initialState,
  reducers: {
    resetRewardsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Rewards
      .addCase(fetchRewards.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRewards.fulfilled, (state, action) => {
        state.loading = false;
        state.rewards = action.payload;
      })
      .addCase(fetchRewards.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch rewards';
      })
      // Fetch Redemptions
      .addCase(fetchRedemptions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRedemptions.fulfilled, (state, action) => {
        state.loading = false;
        state.redemptions = action.payload;
      })
      .addCase(fetchRedemptions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch redemptions';
      })
      // Add Reward
      .addCase(addReward.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addReward.fulfilled, (state, action) => {
        state.loading = false;
        state.rewards[action.payload.id] = action.payload;
      })
      .addCase(addReward.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to add reward';
      })
      // Redeem Reward
      .addCase(redeemReward.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(redeemReward.fulfilled, (state, action) => {
        state.loading = false;
        state.redemptions[action.payload.id] = action.payload;
      })
      .addCase(redeemReward.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to redeem reward';
      })
      // Process Redemption
      .addCase(processRedemption.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(processRedemption.fulfilled, (state, action) => {
        state.loading = false;
        state.redemptions[action.payload.id] = action.payload;
      })
      .addCase(processRedemption.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to process redemption';
      });
  },
});

export const { resetRewardsError } = rewardsSlice.actions;

export default rewardsSlice.reducer;