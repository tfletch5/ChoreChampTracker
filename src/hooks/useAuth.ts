import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppState, User } from '../types';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
  GoogleAuthProvider,
  signInWithCredential,
  AuthCredential
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { setUser, clearUser, setLoading, setError } from '../store/slices/authSlice';
import { createUserProfile, getUserProfile } from '../services/firestore';

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector((state: AppState) => state.auth);
  
  // Reset error state when component mounts
  useEffect(() => {
    return () => {
      dispatch(setError(null));
    };
  }, [dispatch]);

  const signUp = async (
    email: string,
    password: string,
    displayName: string,
    isParent: boolean = true
  ): Promise<User | null> => {
    try {
      dispatch(setLoading(true));
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
      
      // Update Redux state
      dispatch(setUser(userData));
      return userData;
    } catch (err: any) {
      dispatch(setError(err.message));
      return null;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const signIn = async (email: string, password: string): Promise<User | null> => {
    try {
      dispatch(setLoading(true));
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Get user profile from Firestore
      const userData = await getUserProfile(userCredential.user.uid);
      
      if (userData) {
        dispatch(setUser(userData));
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
      dispatch(setUser(basicUser));
      return basicUser;
    } catch (err: any) {
      dispatch(setError(err.message));
      return null;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const signInWithGoogle = async (idToken: string): Promise<User | null> => {
    try {
      dispatch(setLoading(true));
      
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
      
      dispatch(setUser(userData));
      return userData;
    } catch (err: any) {
      dispatch(setError(err.message));
      return null;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      dispatch(setLoading(true));
      await firebaseSignOut(auth);
      dispatch(clearUser());
    } catch (err: any) {
      dispatch(setError(err.message));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const resetPassword = async (email: string): Promise<boolean> => {
    try {
      dispatch(setLoading(true));
      await sendPasswordResetEmail(auth, email);
      return true;
    } catch (err: any) {
      dispatch(setError(err.message));
      return false;
    } finally {
      dispatch(setLoading(false));
    }
  };

  return {
    user,
    loading,
    error,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
  };
};
