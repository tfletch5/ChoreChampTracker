import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, User } from '../../types';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut,
  updateProfile,
  GoogleAuthProvider,
  signInWithCredential
} from 'firebase/auth';
import { auth } from '../../config/firebase';
import { createUserProfile, getUserProfile, updateUserProfile } from '../../services/firestore';

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null
};

// Async thunks for authentication actions
export const signIn = createAsyncThunk(
  'auth/signIn',
  async ({ email, password }: { email: string, password: string }, { rejectWithValue }) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Get user profile from Firestore
      const userData = await getUserProfile(userCredential.user.uid);
      
      if (userData) {
        return userData;
      }
      
      // If no profile exists, create a basic one
      const basicUser: User = {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: userCredential.user.displayName,
        photoURL: userCredential.user.photoURL,
        isParent: true, // Default to parent
      };
      
      await createUserProfile(basicUser);
      return basicUser;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const signUp = createAsyncThunk(
  'auth/signUp',
  async ({ 
    email, 
    password, 
    displayName,
    isParent = true
  }: { 
    email: string, 
    password: string, 
    displayName: string,
    isParent?: boolean
  }, { rejectWithValue }) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile with display name
      await updateProfile(userCredential.user, {
        displayName
      });
      
      // Create user profile in Firestore
      const userData: User = {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName,
        photoURL: userCredential.user.photoURL,
        isParent,
        walletBalance: isParent ? 0 : undefined,
      };
      
      await createUserProfile(userData);
      return userData;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const signInWithGoogle = createAsyncThunk(
  'auth/signInWithGoogle',
  async (idToken: string, { rejectWithValue }) => {
    try {
      // Create Google credential with token
      const credential = GoogleAuthProvider.credential(idToken);
      
      // Sign in with credential
      const userCredential = await signInWithCredential(auth, credential);
      
      // Check if user profile exists
      let userData = await getUserProfile(userCredential.user.uid);
      
      if (!userData) {
        // Create new user profile
        userData = {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          displayName: userCredential.user.displayName,
          photoURL: userCredential.user.photoURL,
          isParent: true, // Default to parent
        };
        
        await createUserProfile(userData);
      }
      
      return userData;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const signOut = createAsyncThunk(
  'auth/signOut',
  async (_, { rejectWithValue }) => {
    try {
      await firebaseSignOut(auth);
      return null;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateUser = createAsyncThunk(
  'auth/updateUser',
  async ({ uid, updates }: { uid: string, updates: Partial<User> }, { rejectWithValue }) => {
    try {
      await updateUserProfile(uid, updates);
      return { uid, ...updates };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.loading = false;
      state.error = null;
    },
    clearUser: (state) => {
      state.user = null;
      state.loading = false;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    // Sign In
    builder.addCase(signIn.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(signIn.fulfilled, (state, action) => {
      state.user = action.payload;
      state.loading = false;
      state.error = null;
    });
    builder.addCase(signIn.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
    
    // Sign Up
    builder.addCase(signUp.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(signUp.fulfilled, (state, action) => {
      state.user = action.payload;
      state.loading = false;
      state.error = null;
    });
    builder.addCase(signUp.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
    
    // Sign In with Google
    builder.addCase(signInWithGoogle.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(signInWithGoogle.fulfilled, (state, action) => {
      state.user = action.payload;
      state.loading = false;
      state.error = null;
    });
    builder.addCase(signInWithGoogle.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
    
    // Sign Out
    builder.addCase(signOut.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(signOut.fulfilled, (state) => {
      state.user = null;
      state.loading = false;
      state.error = null;
    });
    builder.addCase(signOut.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
    
    // Update User
    builder.addCase(updateUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateUser.fulfilled, (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
      state.loading = false;
      state.error = null;
    });
    builder.addCase(updateUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { setUser, clearUser, setLoading, setError } = authSlice.actions;

export default authSlice.reducer;
