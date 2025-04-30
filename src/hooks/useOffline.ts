import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { Chore, Transaction, RewardRedemption, SharedList } from '../types';

interface OfflineAction<T> {
  id: string;
  type: 'add' | 'update' | 'delete';
  collection: string;
  data?: T;
  timestamp: number;
}

export const useOffline = () => {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [pendingActions, setPendingActions] = useState<OfflineAction<any>[]>([]);
  const [syncInProgress, setSyncInProgress] = useState<boolean>(false);

  // Monitor network status
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(!!state.isConnected);
      
      // If we're back online, try to sync pending actions
      if (state.isConnected && pendingActions.length > 0 && !syncInProgress) {
        syncPendingActions();
      }
    });
    
    // Load any pending actions from storage
    loadPendingActions();
    
    return () => {
      unsubscribe();
    };
  }, [pendingActions.length, syncInProgress]);

  // Save pending actions to AsyncStorage
  const savePendingActions = async (actions: OfflineAction<any>[]): Promise<void> => {
    try {
      await AsyncStorage.setItem('pendingActions', JSON.stringify(actions));
      setPendingActions(actions);
    } catch (error) {
      console.error('Error saving pending actions:', error);
    }
  };

  // Load pending actions from AsyncStorage
  const loadPendingActions = async (): Promise<void> => {
    try {
      const storedActions = await AsyncStorage.getItem('pendingActions');
      if (storedActions) {
        setPendingActions(JSON.parse(storedActions));
      }
    } catch (error) {
      console.error('Error loading pending actions:', error);
    }
  };

  // Add an action to the queue
  const queueAction = async <T>(
    type: 'add' | 'update' | 'delete',
    collection: string,
    data?: T,
    id?: string
  ): Promise<string> => {
    const actionId = id || `offline_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    const newAction: OfflineAction<T> = {
      id: actionId,
      type,
      collection,
      data,
      timestamp: Date.now(),
    };
    
    const updatedActions = [...pendingActions, newAction];
    await savePendingActions(updatedActions);
    
    // If online, try to sync immediately
    if (isOnline && !syncInProgress) {
      syncPendingActions();
    }
    
    return actionId;
  };

  // Sync pending actions when we're back online
  const syncPendingActions = async (): Promise<void> => {
    if (pendingActions.length === 0 || syncInProgress) return;
    
    setSyncInProgress(true);
    
    try {
      const actionsToProcess = [...pendingActions];
      const failedActions: OfflineAction<any>[] = [];
      
      // Sort actions by timestamp
      actionsToProcess.sort((a, b) => a.timestamp - b.timestamp);
      
      for (const action of actionsToProcess) {
        const success = await processOfflineAction(action);
        if (!success) {
          failedActions.push(action);
        }
      }
      
      // Save any failed actions back to storage
      await savePendingActions(failedActions);
    } catch (error) {
      console.error('Error syncing pending actions:', error);
    } finally {
      setSyncInProgress(false);
    }
  };

  // Process a single offline action
  const processOfflineAction = async (action: OfflineAction<any>): Promise<boolean> => {
    try {
      // Import service dynamically to avoid circular dependencies
      const { syncOfflineAction } = await import('../services/firestore');
      return await syncOfflineAction(action);
    } catch (error) {
      console.error('Error processing offline action:', error);
      return false;
    }
  };

  // Get cached data from AsyncStorage
  const getCachedData = async <T>(key: string): Promise<T[] | null> => {
    try {
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`Error getting cached ${key}:`, error);
      return null;
    }
  };

  // Save data to AsyncStorage for offline use
  const cacheData = async <T>(key: string, data: T[]): Promise<void> => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Error caching ${key}:`, error);
    }
  };

  // Helper functions for common data types
  const getCachedChores = async (): Promise<Chore[] | null> => {
    return getCachedData<Chore>('offlineChores');
  };

  const cacheChores = async (chores: Chore[]): Promise<void> => {
    return cacheData('offlineChores', chores);
  };

  const getCachedTransactions = async (): Promise<Transaction[] | null> => {
    return getCachedData<Transaction>('offlineTransactions');
  };

  const cacheTransactions = async (transactions: Transaction[]): Promise<void> => {
    return cacheData('offlineTransactions', transactions);
  };

  const getCachedRedemptions = async (): Promise<RewardRedemption[] | null> => {
    return getCachedData<RewardRedemption>('offlineRedemptions');
  };

  const cacheRedemptions = async (redemptions: RewardRedemption[]): Promise<void> => {
    return cacheData('offlineRedemptions', redemptions);
  };

  const getCachedLists = async (): Promise<SharedList[] | null> => {
    return getCachedData<SharedList>('offlineLists');
  };

  const cacheLists = async (lists: SharedList[]): Promise<void> => {
    return cacheData('offlineLists', lists);
  };

  return {
    isOnline,
    pendingActions,
    syncInProgress,
    queueAction,
    syncPendingActions,
    getCachedChores,
    cacheChores,
    getCachedTransactions,
    cacheTransactions,
    getCachedRedemptions,
    cacheRedemptions,
    getCachedLists,
    cacheLists,
  };
};
