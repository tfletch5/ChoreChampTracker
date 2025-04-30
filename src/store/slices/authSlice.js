import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { 
  createUserProfile, 
  getUserProfile, 
  updateUserProfile 
} from '../../services/firestore';

// Initial state for auth
const initialState = {
  user: null,
  loading: false,
  error: null,
};

// Simulated Firebase-like authentication
const mockUsers = {
  'demo@parent.com': { 
    uid: 'parent123', 
    email: 'demo@parent.com', 
    displayName: 'Demo Parent',
    isParent: true,
    photoURL: null,
    walletBalance: 5000, // 50 dollars in cents
    isPremium: true
  },
  'demo@child.com': { 
    uid: 'child123', 
    email: 'demo@child.com', 
    displayName: 'Demo Child',
    isParent: false,
    photoURL: null
  }
};

// Auth thunks
export const signIn = createAsyncThunk(
  'auth/signIn',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      // In a real app, we'd call Firebase auth here
      // For now, use mock data
      if (mockUsers[email] && password === 'password') {
        const userData = mockUsers[email];
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Get or create user profile
        const userProfile = await getUserProfile(userData.uid) || 
                           await createUserProfile(userData.uid, userData);
                           
        return userProfile;
      }
      
      return rejectWithValue('Invalid email or password');
    } catch (error) {
      return rejectWithValue(error.message || 'Sign in failed');
    }
  }
);

export const signUp = createAsyncThunk(
  'auth/signUp',
  async ({ email, password, displayName, isParent }, { rejectWithValue }) => {
    try {
      // In a real app, we'd call Firebase auth createUserWithEmailAndPassword
      // For now, simulate user creation
      
      // Check if user already exists
      if (mockUsers[email]) {
        return rejectWithValue('Email already in use');
      }
      
      // Create a new mock user
      const uid = 'user_' + Math.random().toString(36).substr(2, 9);
      const newUser = {
        uid,
        email,
        displayName,
        isParent,
        photoURL: null,
        walletBalance: isParent ? 5000 : 0, // 50 dollars in cents for parents
      };
      
      // Add to mock users (in a real app, this would be Firebase)
      mockUsers[email] = newUser;
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create user profile in Firestore
      const userProfile = await createUserProfile(uid, newUser);
      
      return userProfile;
    } catch (error) {
      return rejectWithValue(error.message || 'Sign up failed');
    }
  }
);

export const signOut = createAsyncThunk(
  'auth/signOut',
  async (_, { rejectWithValue }) => {
    try {
      // In a real app, we'd call Firebase auth signOut
      // For now, just simulate
      await new Promise(resolve => setTimeout(resolve, 500));
      return null;
    } catch (error) {
      return rejectWithValue(error.message || 'Sign out failed');
    }
  }
);

export const updateUserData = createAsyncThunk(
  'auth/updateUser',
  async (userData, { getState, rejectWithValue }) => {
    try {
      const { user } = getState().auth;
      if (!user) return rejectWithValue('User not authenticated');
      
      // Update user profile in Firestore
      const updatedUser = await updateUserProfile(user.uid, userData);
      return updatedUser;
    } catch (error) {
      return rejectWithValue(error.message || 'Update user failed');
    }
  }
);

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    resetAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Sign In
      .addCase(signIn.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signIn.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(signIn.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Sign in failed';
      })
      // Sign Up
      .addCase(signUp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signUp.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(signUp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Sign up failed';
      })
      // Sign Out
      .addCase(signOut.pending, (state) => {
        state.loading = true;
      })
      .addCase(signOut.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
      })
      .addCase(signOut.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Sign out failed';
      })
      // Update User
      .addCase(updateUserData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserData.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(updateUserData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Update user failed';
      });
  },
});

export const { resetAuthError } = authSlice.actions;

export default authSlice.reducer;