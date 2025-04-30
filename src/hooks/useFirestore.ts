import { useState, useEffect } from 'react';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  onSnapshot,
  orderBy,
  Timestamp,
  writeBatch,
  DocumentData,
  QueryConstraint
} from 'firebase/firestore';
import { firestore } from '../config/firebase';

interface FirestoreHookOptions {
  collectionName: string;
  idField?: string;
  orderByField?: string;
  orderDirection?: 'asc' | 'desc';
  whereConstraints?: QueryConstraint[];
  transformFunction?: (doc: DocumentData) => any;
}

export const useFirestore = <T extends { id: string }>({
  collectionName,
  idField = 'id',
  orderByField,
  orderDirection = 'asc',
  whereConstraints = [],
  transformFunction
}: FirestoreHookOptions) => {
  const [documents, setDocuments] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Reference to the collection
  const collectionRef = collection(firestore, collectionName);

  // Listen to collection changes
  useEffect(() => {
    setLoading(true);
    
    let queryConstraints: QueryConstraint[] = [...whereConstraints];
    
    if (orderByField) {
      queryConstraints.push(orderBy(orderByField, orderDirection));
    }
    
    const q = query(collectionRef, ...queryConstraints);
    
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const results: T[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          const item = {
            ...data,
            [idField]: doc.id,
          };
          
          // Transform data if a transformation function is provided
          const transformedItem = transformFunction ? transformFunction(item) : item;
          results.push(transformedItem as T);
        });
        
        setDocuments(results);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error fetching collection:', err);
        setError(err.message);
        setLoading(false);
      }
    );
    
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [collectionName, JSON.stringify(whereConstraints), orderByField, orderDirection]);

  // Add a document
  const addDocument = async (data: Omit<T, 'id'>): Promise<T | null> => {
    try {
      // Add timestamp fields
      const dataWithTimestamps = {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };
      
      const docRef = await addDoc(collectionRef, dataWithTimestamps);
      
      // Return the new document with its ID
      return {
        ...data,
        id: docRef.id,
      } as T;
    } catch (err: any) {
      console.error('Error adding document:', err);
      setError(err.message);
      return null;
    }
  };

  // Update a document
  const updateDocument = async (id: string, data: Partial<T>): Promise<boolean> => {
    try {
      const docRef = doc(firestore, collectionName, id);
      
      // Add updated timestamp
      const dataWithTimestamp = {
        ...data,
        updatedAt: Timestamp.now(),
      };
      
      await updateDoc(docRef, dataWithTimestamp);
      return true;
    } catch (err: any) {
      console.error('Error updating document:', err);
      setError(err.message);
      return false;
    }
  };

  // Delete a document
  const deleteDocument = async (id: string): Promise<boolean> => {
    try {
      const docRef = doc(firestore, collectionName, id);
      await deleteDoc(docRef);
      return true;
    } catch (err: any) {
      console.error('Error deleting document:', err);
      setError(err.message);
      return false;
    }
  };

  // Get a single document by ID
  const getDocument = async (id: string): Promise<T | null> => {
    try {
      const docRef = doc(firestore, collectionName, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          ...data,
          [idField]: docSnap.id,
        } as T;
      } else {
        return null;
      }
    } catch (err: any) {
      console.error('Error getting document:', err);
      setError(err.message);
      return null;
    }
  };

  // Batch write multiple documents
  const batchWrite = async (operations: Array<{
    type: 'add' | 'update' | 'delete';
    id?: string;
    data?: Partial<T>;
  }>): Promise<boolean> => {
    try {
      const batch = writeBatch(firestore);
      
      operations.forEach((op) => {
        if (op.type === 'add' && op.data) {
          // For adding, we need to create a new doc reference
          const newDocRef = doc(collection(firestore, collectionName));
          batch.set(newDocRef, {
            ...op.data,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
          });
        } else if (op.type === 'update' && op.id && op.data) {
          // For updating, we need the doc ID
          const docRef = doc(firestore, collectionName, op.id);
          batch.update(docRef, {
            ...op.data,
            updatedAt: Timestamp.now(),
          });
        } else if (op.type === 'delete' && op.id) {
          // For deleting, we just need the doc ID
          const docRef = doc(firestore, collectionName, op.id);
          batch.delete(docRef);
        }
      });
      
      await batch.commit();
      return true;
    } catch (err: any) {
      console.error('Error performing batch write:', err);
      setError(err.message);
      return false;
    }
  };

  return {
    documents,
    loading,
    error,
    addDocument,
    updateDocument,
    deleteDocument,
    getDocument,
    batchWrite,
  };
};
