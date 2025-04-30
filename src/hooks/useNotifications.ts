import { useEffect, useState } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { auth } from '../config/firebase';
import { updateUserProfile } from '../services/firestore';
import { AppNotification } from '../types';
import { useFirestore } from './useFirestore';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const useNotifications = () => {
  const [expoPushToken, setExpoPushToken] = useState<string | undefined>();
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const [permissions, setPermissions] = useState<Notifications.NotificationPermissionsStatus | null>(null);
  
  const {
    documents: appNotifications,
    loading: notificationsLoading,
    error: notificationsError,
    addDocument: addNotification,
    updateDocument: updateAppNotification,
  } = useFirestore<AppNotification>({
    collectionName: 'notifications',
    orderByField: 'createdAt',
    orderDirection: 'desc',
    whereConstraints: auth.currentUser 
      ? [where('userId', '==', auth.currentUser.uid)]
      : [],
  });

  // Register for push notifications
  useEffect(() => {
    registerForPushNotificationsAsync().then(token => {
      setExpoPushToken(token);
      if (token && auth.currentUser) {
        // Save the token to the user's profile
        updateUserProfile(auth.currentUser.uid, { expoPushToken: token });
      }
    });

    // Listener for received notifications
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    // Listener for user interaction with notification
    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification clicked:', response);
      // You can handle navigation to specific screens based on notification data here
    });

    // Check permissions
    Notifications.getPermissionsAsync().then(status => {
      setPermissions(status);
    });

    // Cleanup
    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    };
  }, []);

  // Schedule a local notification
  const scheduleNotification = async (
    title: string,
    body: string,
    trigger: Notifications.NotificationTriggerInput = null,
    data: any = {}
  ): Promise<string> => {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: true,
        },
        trigger,
      });
      
      return notificationId;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      throw error;
    }
  };

  // Cancel a scheduled notification
  const cancelNotification = async (notificationId: string): Promise<void> => {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  };

  // Cancel all scheduled notifications
  const cancelAllNotifications = async (): Promise<void> => {
    await Notifications.cancelAllScheduledNotificationsAsync();
  };

  // Mark a notification as read
  const markNotificationAsRead = async (notificationId: string): Promise<boolean> => {
    return await updateAppNotification(notificationId, { read: true });
  };

  // Create an in-app notification
  const createAppNotification = async (
    title: string,
    body: string,
    type: AppNotification['type'],
    data?: any
  ): Promise<AppNotification | null> => {
    if (!auth.currentUser) return null;
    
    const newNotification: Omit<AppNotification, 'id'> = {
      title,
      body,
      type,
      data,
      read: false,
      userId: auth.currentUser.uid,
      createdAt: Date.now(),
    };
    
    return await addNotification(newNotification);
  };

  // Register for push notifications and get token
  const registerForPushNotificationsAsync = async (): Promise<string | undefined> => {
    if (!Device.isDevice) {
      alert('Push Notifications are not supported in the simulator!');
      return undefined;
    }

    // Request permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return undefined;
    }
    
    // Get Expo push token
    const token = (await Notifications.getExpoPushTokenAsync()).data;
    
    // Set up Android channel (required for Android)
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
    
    return token;
  };

  return {
    expoPushToken,
    notification,
    permissions,
    appNotifications,
    notificationsLoading,
    notificationsError,
    scheduleNotification,
    cancelNotification,
    cancelAllNotifications,
    markNotificationAsRead,
    createAppNotification,
    registerForPushNotificationsAsync,
  };
};
