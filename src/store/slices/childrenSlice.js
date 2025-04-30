import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  createChildProfile,
  getChildrenByParent,
  updateUserProfile,
} from '../../services/firestore';

// Initial state for children
const initialState = {
  children: {},
  selectedChildId: null,
  loading: false,
  error: null,
};

// Sample children for demo purposes
const sampleChildren = {
  'child123': {
    id: 'child123',
    name: 'Alex Johnson',
    age: 10,
    avatarURL: null,
    avatar: '👦',
    parentId: 'parent123',
    points: 75,
    streakCount: 3,
    createdAt: Date.now() - 7776000000, // 90 days ago
  },
  'child456': {
    id: 'child456',
    name: 'Emma Johnson',
    age: 8,
    avatarURL: null,
    avatar: '👧',
    parentId: 'parent123',
    points: 50,
    streakCount: 2,
    createdAt: Date.now() - 6912000000, // 80 days ago
  }
};

// Children thunks
export const fetchChildren = createAsyncThunk(
  'children/fetchChildren',
  async (parentId, { rejectWithValue }) => {
    try {
      // In a real app, fetch from Firebase
      // For now, use sample data
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return sampleChildren;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch children');
    }
  }
);

export const addChild = createAsyncThunk(
  'children/addChild',
  async (childData, { rejectWithValue }) => {
    try {
      const newChild = await createChildProfile({
        ...childData,
        points: 0,
        streakCount: 0,
        createdAt: Date.now(),
      });
      
      return newChild;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to add child');
    }
  }
);

export const updateChildProfile = createAsyncThunk(
  'children/updateChildProfile',
  async ({ childId, updates }, { rejectWithValue, getState }) => {
    try {
      const { children } = getState().children;
      if (!children[childId]) {
        return rejectWithValue('Child not found');
      }
      
      // In a real app, this would update Firestore
      // For now, just simulate the update
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedChild = {
        ...children[childId],
        ...updates,
      };
      
      return updatedChild;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update child profile');
    }
  }
);

export const incrementPoints = createAsyncThunk(
  'children/incrementPoints',
  async ({ childId, points }, { rejectWithValue, getState }) => {
    try {
      const { children } = getState().children;
      if (!children[childId]) {
        return rejectWithValue('Child not found');
      }
      
      const currentPoints = children[childId].points || 0;
      const updatedPoints = currentPoints + points;
      
      // In a real app, this would update Firestore
      // For now, just simulate the update
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const updatedChild = {
        ...children[childId],
        points: updatedPoints,
      };
      
      return updatedChild;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to increment points');
    }
  }
);

export const updateStreak = createAsyncThunk(
  'children/updateStreak',
  async ({ childId, increment = true }, { rejectWithValue, getState }) => {
    try {
      const { children } = getState().children;
      if (!children[childId]) {
        return rejectWithValue('Child not found');
      }
      
      const currentStreak = children[childId].streakCount || 0;
      const updatedStreak = increment ? currentStreak + 1 : 0;
      
      // In a real app, this would update Firestore
      // For now, just simulate the update
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const updatedChild = {
        ...children[childId],
        streakCount: updatedStreak,
      };
      
      return updatedChild;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update streak');
    }
  }
);

// Children slice
const childrenSlice = createSlice({
  name: 'children',
  initialState,
  reducers: {
    selectChild: (state, action) => {
      state.selectedChildId = action.payload;
    },
    resetChildrenError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Children
      .addCase(fetchChildren.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChildren.fulfilled, (state, action) => {
        state.loading = false;
        state.children = action.payload;
        // Auto-select the first child if none is selected
        if (!state.selectedChildId && Object.keys(action.payload).length > 0) {
          state.selectedChildId = Object.keys(action.payload)[0];
        }
      })
      .addCase(fetchChildren.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch children';
      })
      // Add Child
      .addCase(addChild.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addChild.fulfilled, (state, action) => {
        state.loading = false;
        state.children[action.payload.id] = action.payload;
        // Auto-select the new child if none is selected
        if (!state.selectedChildId) {
          state.selectedChildId = action.payload.id;
        }
      })
      .addCase(addChild.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to add child';
      })
      // Update Child Profile
      .addCase(updateChildProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateChildProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.children[action.payload.id] = action.payload;
      })
      .addCase(updateChildProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to update child profile';
      })
      // Increment Points
      .addCase(incrementPoints.fulfilled, (state, action) => {
        state.children[action.payload.id] = action.payload;
      })
      // Update Streak
      .addCase(updateStreak.fulfilled, (state, action) => {
        state.children[action.payload.id] = action.payload;
      });
  },
});

export const { selectChild, resetChildrenError } = childrenSlice.actions;

export default childrenSlice.reducer;