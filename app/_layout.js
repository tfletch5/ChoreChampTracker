import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { Provider } from 'react-redux';
import store from '../src/store';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';

export default function RootLayout() {
  return (
    <Provider store={store}>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="tabs" options={{ headerShown: false }} />
        <Stack.Screen name="auth/login" options={{ title: 'Login' }} />
        <Stack.Screen name="auth/signup" options={{ title: 'Sign Up' }} />
        <Stack.Screen name="parent/add-child" options={{ title: 'Add Child Profile' }} />
        <Stack.Screen name="parent/manage-chores" options={{ title: 'Manage Chores' }} />
        <Stack.Screen name="parent/manage-rewards" options={{ title: 'Manage Rewards' }} />
        <Stack.Screen name="parent/analytics" options={{ title: 'Analytics' }} />
        <Stack.Screen name="child/chore-details" options={{ title: 'Chore Details' }} />
        <Stack.Screen name="child/reward-shop" options={{ title: 'Reward Shop' }} />
        <Stack.Screen name="child/progress" options={{ title: 'My Progress' }} />
        <Stack.Screen name="child/profile" options={{ title: 'Child Profile' }} />
      </Stack>
    </Provider>
  );
}