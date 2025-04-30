import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Initial state
const initialState = {
  balance: 0, // Current wallet balance in cents
  transactions: {},
  pointToMoneyRatio: 10, // 10 cents per point by default
  loading: false,
  error: null,
};

// Async thunks for API calls - to be implemented with backend
export const fetchWalletBalance = createAsyncThunk(
  'wallet/fetchWalletBalance',
  async (userId, { rejectWithValue }) => {
    try {
      // For now, just return mock data
      return 2000; // $20.00
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchTransactions = createAsyncThunk(
  'wallet/fetchTransactions',
  async (userId, { rejectWithValue }) => {
    try {
      // For now, just return mock data
      const now = Date.now();
      const dayInMs = 24 * 60 * 60 * 1000;
      
      return {
        '1': {
          id: '1',
          type: 'deposit',
          amount: 1000, // $10.00
          description: 'Weekly allowance',
          parentId: 'parent1',
          childId: '1',
          status: 'completed',
          createdAt: now - (7 * dayInMs),
          updatedAt: now - (7 * dayInMs),
        },
        '2': {
          id: '2',
          type: 'reward',
          amount: 500, // $5.00
          description: 'Reward redemption',
          parentId: 'parent1',
          childId: '1',
          status: 'completed',
          createdAt: now - (3 * dayInMs),
          updatedAt: now - (3 * dayInMs),
        },
        '3': {
          id: '3',
          type: 'deposit',
          amount: 1000, // $10.00
          description: 'Weekly allowance',
          parentId: 'parent1',
          childId: '2',
          status: 'completed',
          createdAt: now - (7 * dayInMs),
          updatedAt: now - (7 * dayInMs),
        },
        '4': {
          id: '4',
          type: 'withdrawal',
          amount: 500, // $5.00
          description: 'Cash withdrawal',
          parentId: 'parent1',
          childId: '2',
          status: 'pending',
          createdAt: now - dayInMs,
          updatedAt: now - dayInMs,
        },
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addTransaction = createAsyncThunk(
  'wallet/addTransaction',
  async (transactionData, { rejectWithValue }) => {
    try {
      // Simulate API call
      const newTransaction = {
        ...transactionData,
        id: Math.random().toString(36).substr(2, 9),
        status: 'pending',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      
      return newTransaction;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateTransaction = createAsyncThunk(
  'wallet/updateTransaction',
  async ({ transactionId, updates }, { rejectWithValue }) => {
    try {
      // Simulate API call
      return {
        id: transactionId,
        ...updates,
        updatedAt: Date.now(),
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateWalletBalance = createAsyncThunk(
  'wallet/updateWalletBalance',
  async ({ userId, amount, isAdd = true }, { rejectWithValue }) => {
    try {
      // Simulate API call to update wallet balance
      // amount is in cents
      return { amount, isAdd };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updatePointToMoneyRatio = createAsyncThunk(
  'wallet/updatePointToMoneyRatio',
  async (ratio, { rejectWithValue }) => {
    try {
      // Simulate API call to update point-to-money ratio
      return ratio;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Wallet slice
const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    resetWalletState: (state) => {
      state.balance = 0;
      state.transactions = {};
      state.pointToMoneyRatio = 10; // Default 10 cents per point
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch wallet balance
      .addCase(fetchWalletBalance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWalletBalance.fulfilled, (state, action) => {
        state.balance = action.payload;
        state.loading = false;
      })
      .addCase(fetchWalletBalance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch transactions
      .addCase(fetchTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.transactions = action.payload;
        state.loading = false;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Add transaction
      .addCase(addTransaction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addTransaction.fulfilled, (state, action) => {
        state.transactions[action.payload.id] = action.payload;
        
        // If the transaction is completed, update the balance
        if (action.payload.status === 'completed') {
          if (action.payload.type === 'deposit' || action.payload.type === 'reward') {
            state.balance += action.payload.amount;
          } else if (action.payload.type === 'withdrawal') {
            state.balance -= action.payload.amount;
          }
        }
        
        state.loading = false;
      })
      .addCase(addTransaction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update transaction
      .addCase(updateTransaction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTransaction.fulfilled, (state, action) => {
        const { id, ...updates } = action.payload;
        
        if (state.transactions[id]) {
          const oldTransaction = state.transactions[id];
          const newTransaction = { ...oldTransaction, ...updates };
          state.transactions[id] = newTransaction;
          
          // If the status changed to 'completed', update the balance
          if (oldTransaction.status !== 'completed' && newTransaction.status === 'completed') {
            if (newTransaction.type === 'deposit' || newTransaction.type === 'reward') {
              state.balance += newTransaction.amount;
            } else if (newTransaction.type === 'withdrawal') {
              state.balance -= newTransaction.amount;
            }
          }
          
          // If the status changed from 'completed', reverse the balance update
          if (oldTransaction.status === 'completed' && newTransaction.status !== 'completed') {
            if (oldTransaction.type === 'deposit' || oldTransaction.type === 'reward') {
              state.balance -= oldTransaction.amount;
            } else if (oldTransaction.type === 'withdrawal') {
              state.balance += oldTransaction.amount;
            }
          }
        }
        
        state.loading = false;
      })
      .addCase(updateTransaction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update wallet balance
      .addCase(updateWalletBalance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateWalletBalance.fulfilled, (state, action) => {
        const { amount, isAdd } = action.payload;
        state.balance = isAdd ? state.balance + amount : state.balance - amount;
        state.loading = false;
      })
      .addCase(updateWalletBalance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update point-to-money ratio
      .addCase(updatePointToMoneyRatio.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePointToMoneyRatio.fulfilled, (state, action) => {
        state.pointToMoneyRatio = action.payload;
        state.loading = false;
      })
      .addCase(updatePointToMoneyRatio.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetWalletState } = walletSlice.actions;
export default walletSlice.reducer;