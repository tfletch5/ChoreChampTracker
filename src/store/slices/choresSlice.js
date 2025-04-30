import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Initial state
const initialState = {
  chores: {},
  loading: false,
  error: null,
};

// Async thunks for API calls - to be implemented with backend
export const fetchChores = createAsyncThunk(
  'chores/fetchChores',
  async (parentId, { rejectWithValue }) => {
    try {
      // For now, just return mock data
      return {
        '1': {
          id: '1',
          title: 'Clean bedroom',
          description: 'Make bed, put away toys, vacuum floor',
          pointValue: 10,
          dueDate: Date.now() + 86400000, // tomorrow
          isRecurring: false,
          assignedTo: '1', // child ID
          status: 'pending',
          createdBy: 'parent1',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          reminders: [],
        },
        '2': {
          id: '2',
          title: 'Take out trash',
          description: 'Take all trash bags to the curb',
          pointValue: 5,
          dueDate: Date.now(),
          isRecurring: true,
          recurringPattern: {
            frequency: 'weekly',
            interval: 1,
            daysOfWeek: [1, 4], // Monday and Thursday
          },
          assignedTo: '1',
          completedAt: Date.now() - 3600000, // 1 hour ago
          status: 'completed',
          createdBy: 'parent1',
          createdAt: Date.now() - 604800000, // 1 week ago
          updatedAt: Date.now() - 3600000,
          reminders: [],
        },
        '3': {
          id: '3',
          title: 'Wash dishes',
          description: 'Clean all dishes in the sink',
          pointValue: 15,
          dueDate: Date.now() + 172800000, // 2 days from now
          isRecurring: false,
          assignedTo: '2',
          status: 'pending',
          createdBy: 'parent1',
          createdAt: Date.now() - 86400000,
          updatedAt: Date.now() - 86400000,
          reminders: [],
        },
        '4': {
          id: '4',
          title: 'Homework',
          description: 'Complete math and science assignments',
          pointValue: 20,
          dueDate: Date.now() - 86400000, // yesterday
          isRecurring: false,
          assignedTo: '2',
          status: 'overdue',
          createdBy: 'parent1',
          createdAt: Date.now() - 172800000,
          updatedAt: Date.now() - 172800000,
          reminders: [],
        },
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addChore = createAsyncThunk(
  'chores/addChore',
  async (choreData, { rejectWithValue }) => {
    try {
      // Simulate API call
      const newChore = {
        ...choreData,
        id: Math.random().toString(36).substr(2, 9),
        createdAt: Date.now(),
        updatedAt: Date.now(),
        status: 'pending',
      };
      
      return newChore;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateChore = createAsyncThunk(
  'chores/updateChore',
  async ({ choreId, updates }, { rejectWithValue }) => {
    try {
      // Simulate API call
      return {
        id: choreId,
        ...updates,
        updatedAt: Date.now(),
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const completeChore = createAsyncThunk(
  'chores/completeChore',
  async (choreId, { rejectWithValue }) => {
    try {
      // Simulate API call
      return {
        id: choreId,
        status: 'completed',
        completedAt: Date.now(),
        updatedAt: Date.now(),
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteChore = createAsyncThunk(
  'chores/deleteChore',
  async (choreId, { rejectWithValue }) => {
    try {
      // Simulate API call
      return choreId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Chores slice
const choresSlice = createSlice({
  name: 'chores',
  initialState,
  reducers: {
    resetChoresState: (state) => {
      state.chores = {};
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch chores
      .addCase(fetchChores.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChores.fulfilled, (state, action) => {
        state.chores = action.payload;
        state.loading = false;
      })
      .addCase(fetchChores.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Add chore
      .addCase(addChore.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addChore.fulfilled, (state, action) => {
        state.chores[action.payload.id] = action.payload;
        state.loading = false;
      })
      .addCase(addChore.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update chore
      .addCase(updateChore.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateChore.fulfilled, (state, action) => {
        const { id, ...updates } = action.payload;
        if (state.chores[id]) {
          state.chores[id] = { ...state.chores[id], ...updates };
        }
        state.loading = false;
      })
      .addCase(updateChore.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Complete chore
      .addCase(completeChore.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(completeChore.fulfilled, (state, action) => {
        const { id, ...updates } = action.payload;
        if (state.chores[id]) {
          state.chores[id] = { ...state.chores[id], ...updates };
        }
        state.loading = false;
      })
      .addCase(completeChore.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete chore
      .addCase(deleteChore.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteChore.fulfilled, (state, action) => {
        delete state.chores[action.payload];
        state.loading = false;
      })
      .addCase(deleteChore.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetChoresState } = choresSlice.actions;
export default choresSlice.reducer;