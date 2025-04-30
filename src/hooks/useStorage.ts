import { useState } from 'react';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../config/firebase';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

export const useStorage = (path: string = 'images') => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Convert URI to Blob
  const uriToBlob = async (uri: string): Promise<Blob> => {
    const response = await fetch(uri);
    const blob = await response.blob();
    return blob;
  };

  // Upload image from library
  const pickAndUploadImage = async (): Promise<string | null> => {
    try {
      setError(null);
      
      // Request permission
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        setError('Permission to access media library is required!');
        return null;
      }
      
      // Pick image
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      
      if (result.canceled) return null;
      
      return await uploadImage(result.assets[0].uri);
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  };

  // Take photo and upload
  const takeAndUploadPhoto = async (): Promise<string | null> => {
    try {
      setError(null);
      
      // Request permission
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      
      if (!permissionResult.granted) {
        setError('Permission to access camera is required!');
        return null;
      }
      
      // Take photo
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      
      if (result.canceled) return null;
      
      return await uploadImage(result.assets[0].uri);
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  };

  // Upload image to Firebase Storage
  const uploadImage = async (uri: string, customPath?: string): Promise<string | null> => {
    try {
      setUploading(true);
      setProgress(0);
      setError(null);
      
      // Get file info
      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (!fileInfo.exists) {
        setError('File does not exist');
        return null;
      }
      
      // Create unique filename
      const fileExtension = uri.split('.').pop();
      const fileName = `${Date.now()}.${fileExtension}`;
      const storagePath = customPath || path;
      const storageRef = ref(storage, `${storagePath}/${fileName}`);
      
      // Convert URI to blob and upload
      const blob = await uriToBlob(uri);
      const uploadTask = await uploadBytes(storageRef, blob);
      
      // Get download URL
      const downloadURL = await getDownloadURL(uploadTask.ref);
      
      setProgress(100);
      return downloadURL;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setUploading(false);
    }
  };

  // Delete image from Firebase Storage
  const deleteImage = async (url: string): Promise<boolean> => {
    try {
      setError(null);
      
      // Extract reference path from URL
      const httpsReference = ref(storage, url);
      
      // Delete the file
      await deleteObject(httpsReference);
      
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  };

  return {
    uploading,
    progress,
    error,
    pickAndUploadImage,
    takeAndUploadPhoto,
    uploadImage,
    deleteImage,
  };
};
