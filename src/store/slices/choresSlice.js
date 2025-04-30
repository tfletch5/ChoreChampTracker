import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  createChore,
  getChoresByChild,
  getChoresByParent,
  updateChore
} from '../../services/firestore';

// Initial state for chores
const initialState = {
  chores: {},
  loading: false,
  error: null,
};

// Sample chores for demo purposes
const sampleChores = {
  'chore1': {
    id: 'chore1',
    title: 'Clean bedroom',
    description: 'Make bed, pick up toys, and vacuum floor',
    pointValue: 10,
    dueDate: Date.now() + 86400000, // 1 day from now
    isRecurring: false,
    assignedTo: 'child123',
    status: 'pending',
    createdBy: 'parent123',
    createdAt: Date.now() - 86400000, // 1 day ago
    updatedAt: Date.now() - 86400000, // 1 day ago
    reminders: []
  },
  'chore2': {
    id: 'chore2',
    title: 'Do the dishes',
    description: 'Wash all dishes after dinner',
    pointValue: 5,
    dueDate: Date.now() + 43200000, // 12 hours from now
    isRecurring: true,
    recurringPattern: {
      frequency: 'daily',
      interval: 1,
    },
    assignedTo: 'child123',
    status: 'pending',
    createdBy: 'parent123',
    createdAt: Date.now() - 172800000, // 2 days ago
    updatedAt: Date.now() - 172800000, // 2 days ago
    reminders: []
  },
  'chore3': {
    id: 'chore3',
    title: 'Take out trash',
    description: 'Empty all trash cans and take to curb',
    pointValue: 3,
    dueDate: Date.now() + 21600000, // 6 hours from now
    isRecurring: true,
    recurringPattern: {
      frequency: 'weekly',
      interval: 1,
      daysOfWeek: [1, 4] // Monday and Thursday
    },
    assignedTo: 'child123',
    status: 'pending',
    createdBy: 'parent123',
    createdAt: Date.now() - 259200000, // 3 days ago
    updatedAt: Date.now() - 259200000, // 3 days ago
    reminders: []
  },
  'chore4': {
    id: 'chore4',
    title: 'Fold laundry',
    description: 'Fold clean clothes and put away in drawers',
    pointValue: 8,
    dueDate: Date.now() - 43200000, // 12 hours ago (overdue)
    isRecurring: false,
    assignedTo: 'child123',
    status: 'overdue',
    createdBy: 'parent123', 
    createdAt: Date.now() - 345600000, // 4 days ago
    updatedAt: Date.now() - 345600000, // 4 days ago
    reminders: []
  },
  'chore5': {
    id: 'chore5',
    title: 'Mow the lawn',
    description: 'Mow front and back yard',
    pointValue: 15,
    dueDate: Date.now() + 172800000, // 2 days from now
    isRecurring: true,
    recurringPattern: {
      frequency: 'weekly',
      interval: 2, // every 2 weeks
      daysOfWeek: [6] // Saturday
    },
    assignedTo: 'child123',
    status: 'pending',
    createdBy: 'parent123',
    createdAt: Date.now() - 432000000, // 5 days ago
    updatedAt: Date.now() - 432000000, // 5 days ago
    reminders: []
  },
};

// Chores thunks
export const fetchChores = createAsyncThunk(
  'chores/fetchChores',
  async ({ userId, isParent }, { rejectWithValue }) => {
    try {
      // In a real app, fetch from Firebase
      // For now, use sample data
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Return sample chores
      return sampleChores;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch chores');
    }
  }
);

export const addChore = createAsyncThunk(
  'chores/addChore',
  async (choreData, { rejectWithValue }) => {
    try {
      const newChore = await createChore(choreData);
      return newChore;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to add chore');
    }
  }
);

export const completeChore = createAsyncThunk(
  'chores/completeChore',
  async (choreId, { rejectWithValue, getState }) => {
    try {
      const { chores } = getState().chores;
      if (!chores[choreId]) {
        return rejectWithValue('Chore not found');
      }
      
      const updatedChore = await updateChore(choreId, {
        status: 'completed',
        completedAt: Date.now(),
      });
      
      return updatedChore;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to complete chore');
    }
  }
);

export const updateChoreDetails = createAsyncThunk(
  'chores/updateChoreDetails',
  async ({ choreId, updates }, { rejectWithValue, getState }) => {
    try {
      const { chores } = getState().chores;
      if (!chores[choreId]) {
        return rejectWithValue('Chore not found');
      }
      
      const updatedChore = await updateChore(choreId, {
        ...updates,
        updatedAt: Date.now(),
      });
      
      return updatedChore;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update chore');
    }
  }
);

// Chores slice
const choresSlice = createSlice({
  name: 'chores',
  initialState,
  reducers: {
    resetChoresError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Chores
      .addCase(fetchChores.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChores.fulfilled, (state, action) => {
        state.loading = false;
        state.chores = action.payload;
      })
      .addCase(fetchChores.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch chores';
      })
      // Add Chore
      .addCase(addChore.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addChore.fulfilled, (state, action) => {
        state.loading = false;
        state.chores[action.payload.id] = action.payload;
      })
      .addCase(addChore.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to add chore';
      })
      // Complete Chore
      .addCase(completeChore.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(completeChore.fulfilled, (state, action) => {
        state.loading = false;
        state.chores[action.payload.id] = action.payload;
      })
      .addCase(completeChore.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to complete chore';
      })
      // Update Chore
      .addCase(updateChoreDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateChoreDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.chores[action.payload.id] = action.payload;
      })
      .addCase(updateChoreDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to update chore';
      });
  },
});

export const { resetChoresError } = choresSlice.actions;

export default choresSlice.reducer;