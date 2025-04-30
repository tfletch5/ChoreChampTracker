import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Initial state for wallet
const initialState = {
  balance: 0,
  transactions: {},
  pointToMoneyRatio: 1, // 1 point = 1 cent by default
  loading: false,
  error: null,
};

// Sample transactions for demo purposes
const sampleTransactions = {
  'transaction1': {
    id: 'transaction1',
    type: 'deposit',
    amount: 2000, // $20.00 in cents
    description: 'Initial wallet deposit',
    parentId: 'parent123',
    status: 'completed',
    createdAt: Date.now() - 2592000000, // 30 days ago
    updatedAt: Date.now() - 2592000000,
  },
  'transaction2': {
    id: 'transaction2',
    type: 'reward',
    amount: 500, // $5.00 in cents
    description: 'Reward redemption - $5 Allowance',
    childId: 'child123',
    parentId: 'parent123',
    status: 'completed',
    createdAt: Date.now() - 345600000, // 4 days ago
    updatedAt: Date.now() - 345600000,
  },
  'transaction3': {
    id: 'transaction3',
    type: 'withdrawal',
    amount: -1000, // $10.00 in cents
    description: 'Cash withdrawal',
    childId: 'child123',
    parentId: 'parent123',
    status: 'completed',
    createdAt: Date.now() - 172800000, // 2 days ago
    updatedAt: Date.now() - 172800000,
  },
  'transaction4': {
    id: 'transaction4',
    type: 'deposit',
    amount: 1500, // $15.00 in cents
    description: 'Weekly allowance',
    childId: 'child123',
    parentId: 'parent123',
    status: 'completed',
    createdAt: Date.now() - 86400000, // 1 day ago
    updatedAt: Date.now() - 86400000,
  },
  'transaction5': {
    id: 'transaction5',
    type: 'reward',
    amount: 500, // $5.00 in cents
    description: 'Reward redemption - $5 Allowance',
    childId: 'child123',
    parentId: 'parent123',
    status: 'pending',
    createdAt: Date.now() - 43200000, // 12 hours ago
    updatedAt: Date.now() - 43200000,
  },
};

// Wallet thunks
export const fetchWalletData = createAsyncThunk(
  'wallet/fetchWalletData',
  async (userId, { rejectWithValue }) => {
    try {
      // In a real app, fetch from Firebase
      // For now, use sample data
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Calculate total balance from completed transactions
      const transactions = sampleTransactions;
      const completedTransactions = Object.values(transactions).filter(
        t => t.status === 'completed' && (t.childId === userId || t.parentId === userId)
      );
      
      const balance = completedTransactions.reduce(
        (total, t) => total + t.amount, 
        0
      );
      
      return {
        balance,
        transactions,
        pointToMoneyRatio: 1, // 1 point = 1 cent
      };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch wallet data');
    }
  }
);

export const addTransaction = createAsyncThunk(
  'wallet/addTransaction',
  async (transactionData, { rejectWithValue }) => {
    try {
      // In a real app, add to Firebase
      // For now, just simulate
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newTransaction = {
        ...transactionData,
        id: 'transaction_' + Math.random().toString(36).substr(2, 9),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      
      return newTransaction;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to add transaction');
    }
  }
);

export const processTransaction = createAsyncThunk(
  'wallet/processTransaction',
  async ({ transactionId, status }, { rejectWithValue, getState }) => {
    try {
      const { transactions } = getState().wallet;
      
      if (!transactions[transactionId]) {
        return rejectWithValue('Transaction not found');
      }
      
      // In a real app, update in Firebase
      // For now, just simulate
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedTransaction = {
        ...transactions[transactionId],
        status,
        updatedAt: Date.now(),
      };
      
      return updatedTransaction;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to process transaction');
    }
  }
);

export const updatePointToMoneyRatio = createAsyncThunk(
  'wallet/updatePointToMoneyRatio',
  async (ratio, { rejectWithValue }) => {
    try {
      if (ratio <= 0) {
        return rejectWithValue('Ratio must be greater than 0');
      }
      
      // In a real app, save to parent's settings in Firebase
      // For now, just simulate
      await new Promise(resolve => setTimeout(resolve, 300));
      
      return ratio;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update ratio');
    }
  }
);

// Wallet slice
const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    resetWalletError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Wallet Data
      .addCase(fetchWalletData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWalletData.fulfilled, (state, action) => {
        state.loading = false;
        state.balance = action.payload.balance;
        state.transactions = action.payload.transactions;
        state.pointToMoneyRatio = action.payload.pointToMoneyRatio;
      })
      .addCase(fetchWalletData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch wallet data';
      })
      // Add Transaction
      .addCase(addTransaction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addTransaction.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions[action.payload.id] = action.payload;
        
        // Update balance if transaction is completed
        if (action.payload.status === 'completed') {
          state.balance += action.payload.amount;
        }
      })
      .addCase(addTransaction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to add transaction';
      })
      // Process Transaction
      .addCase(processTransaction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(processTransaction.fulfilled, (state, action) => {
        state.loading = false;
        const oldTransaction = state.transactions[action.payload.id];
        state.transactions[action.payload.id] = action.payload;
        
        // Update balance if transaction status changed
        if (oldTransaction.status !== 'completed' && action.payload.status === 'completed') {
          state.balance += action.payload.amount;
        } else if (oldTransaction.status === 'completed' && action.payload.status !== 'completed') {
          state.balance -= action.payload.amount;
        }
      })
      .addCase(processTransaction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to process transaction';
      })
      // Update Point to Money Ratio
      .addCase(updatePointToMoneyRatio.fulfilled, (state, action) => {
        state.pointToMoneyRatio = action.payload;
      })
      .addCase(updatePointToMoneyRatio.rejected, (state, action) => {
        state.error = action.payload || 'Failed to update ratio';
      });
  },
});

export const { resetWalletError } = walletSlice.actions;

export default walletSlice.reducer;