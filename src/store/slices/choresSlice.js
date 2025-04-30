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
  async ({ parentId, childId }, { rejectWithValue }) => {
    try {
      // For now, just return mock data
      // In a real app, this would fetch from Firestore or another backend
      const now = Date.now();
      const dayInMs = 24 * 60 * 60 * 1000;
      
      const mockChores = {
        '1': {
          id: '1',
          title: 'Clean bedroom',
          description: 'Make bed, put toys away, and vacuum floor',
          pointValue: 20,
          dueDate: now + (2 * dayInMs), // 2 days from now
          isRecurring: true,
          recurringPattern: {
            frequency: 'weekly',
            interval: 1,
            daysOfWeek: [1, 5], // Monday and Friday
          },
          assignedTo: '1', // childId
          status: 'pending',
          createdBy: 'parent1',
          createdAt: now - (10 * dayInMs),
          updatedAt: now - (10 * dayInMs),
          reminders: [
            {
              id: '1-1',
              time: now + dayInMs, // 1 day before due
              sent: false,
            },
          ],
        },
        '2': {
          id: '2',
          title: 'Feed the dog',
          description: 'Fill food and water bowls',
          pointValue: 10,
          dueDate: now + dayInMs, // 1 day from now
          isRecurring: true,
          recurringPattern: {
            frequency: 'daily',
            interval: 1,
          },
          assignedTo: '2', // childId
          status: 'pending',
          createdBy: 'parent1',
          createdAt: now - (15 * dayInMs),
          updatedAt: now - (15 * dayInMs),
          reminders: [],
        },
        '3': {
          id: '3',
          title: 'Take out trash',
          description: 'Empty all trash cans and take to outdoor bin',
          pointValue: 15,
          dueDate: now - dayInMs, // 1 day ago (overdue)
          isRecurring: false,
          assignedTo: '1', // childId
          status: 'overdue',
          createdBy: 'parent1',
          createdAt: now - (5 * dayInMs),
          updatedAt: now - (5 * dayInMs),
          reminders: [],
        },
        '4': {
          id: '4',
          title: 'Set dinner table',
          description: 'Place plates, utensils, and napkins',
          pointValue: 5,
          dueDate: now - (3 * dayInMs), // 3 days ago
          isRecurring: true,
          recurringPattern: {
            frequency: 'daily',
            interval: 1,
          },
          assignedTo: '2', // childId
          completedAt: now - (3 * dayInMs) + (2 * 60 * 60 * 1000), // Completed 2 hours after due time
          status: 'completed',
          createdBy: 'parent1',
          createdAt: now - (20 * dayInMs),
          updatedAt: now - (3 * dayInMs) + (2 * 60 * 60 * 1000),
          reminders: [],
        },
      };
      
      // If a childId is provided, filter chores for that child
      if (childId) {
        const filteredChores = {};
        Object.keys(mockChores).forEach(key => {
          if (mockChores[key].assignedTo === childId) {
            filteredChores[key] = mockChores[key];
          }
        });
        return filteredChores;
      }
      
      return mockChores;
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
        status: 'pending',
        createdAt: Date.now(),
        updatedAt: Date.now(),
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

export const completeChore = createAsyncThunk(
  'chores/completeChore',
  async (choreId, { getState, rejectWithValue }) => {
    try {
      // Simulate API call
      const state = getState();
      const chore = state.chores.chores[choreId];
      
      if (!chore) {
        return rejectWithValue('Chore not found');
      }
      
      // Check if the chore is recurring
      let newStatus = 'completed';
      let completedAt = Date.now();
      
      return {
        id: choreId,
        status: newStatus,
        completedAt,
        updatedAt: Date.now(),
      };
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
      });
  },
});

export const { resetChoresState } = choresSlice.actions;
export default choresSlice.reducer;