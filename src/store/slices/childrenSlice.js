import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Initial state
const initialState = {
  children: {},
  selectedChildId: null,
  loading: false,
  error: null,
};

// Async thunks for API calls - to be implemented with backend
export const fetchChildren = createAsyncThunk(
  'children/fetchChildren',
  async (parentId, { rejectWithValue }) => {
    try {
      // For now, just return mock data
      return {
        '1': {
          id: '1',
          name: 'Alex',
          age: 9,
          avatarURL: '',
          avatar: '👦',
          parentId: 'parent1',
          points: 150,
          streakCount: 3,
          createdAt: Date.now() - 2592000000, // 30 days ago
        },
        '2': {
          id: '2',
          name: 'Sophia',
          age: 7,
          avatarURL: '',
          avatar: '👧',
          parentId: 'parent1',
          points: 120,
          streakCount: 2,
          createdAt: Date.now() - 2592000000, // 30 days ago
        },
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addChild = createAsyncThunk(
  'children/addChild',
  async (childData, { rejectWithValue }) => {
    try {
      // Simulate API call
      const newChild = {
        ...childData,
        id: Math.random().toString(36).substr(2, 9),
        createdAt: Date.now(),
        points: 0,
        streakCount: 0,
      };
      
      return newChild;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateChild = createAsyncThunk(
  'children/updateChild',
  async ({ childId, updates }, { rejectWithValue }) => {
    try {
      // Simulate API call
      return {
        id: childId,
        ...updates,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteChild = createAsyncThunk(
  'children/deleteChild',
  async (childId, { rejectWithValue }) => {
    try {
      // Simulate API call
      return childId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addPointsToChild = createAsyncThunk(
  'children/addPointsToChild',
  async ({ childId, points }, { rejectWithValue }) => {
    try {
      // Simulate API call
      return {
        childId,
        points,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Children slice
const childrenSlice = createSlice({
  name: 'children',
  initialState,
  reducers: {
    setSelectedChild: (state, action) => {
      state.selectedChildId = action.payload;
    },
    resetChildrenState: (state) => {
      state.children = {};
      state.selectedChildId = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch children
      .addCase(fetchChildren.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChildren.fulfilled, (state, action) => {
        state.children = action.payload;
        state.loading = false;
      })
      .addCase(fetchChildren.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Add child
      .addCase(addChild.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addChild.fulfilled, (state, action) => {
        state.children[action.payload.id] = action.payload;
        state.loading = false;
      })
      .addCase(addChild.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update child
      .addCase(updateChild.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateChild.fulfilled, (state, action) => {
        const { id, ...updates } = action.payload;
        if (state.children[id]) {
          state.children[id] = { ...state.children[id], ...updates };
        }
        state.loading = false;
      })
      .addCase(updateChild.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete child
      .addCase(deleteChild.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteChild.fulfilled, (state, action) => {
        delete state.children[action.payload];
        if (state.selectedChildId === action.payload) {
          state.selectedChildId = null;
        }
        state.loading = false;
      })
      .addCase(deleteChild.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Add points to child
      .addCase(addPointsToChild.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addPointsToChild.fulfilled, (state, action) => {
        const { childId, points } = action.payload;
        if (state.children[childId]) {
          state.children[childId].points += points;
        }
        state.loading = false;
      })
      .addCase(addPointsToChild.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setSelectedChild, resetChildrenState } = childrenSlice.actions;
export default childrenSlice.reducer;