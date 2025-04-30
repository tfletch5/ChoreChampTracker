import React from 'react';
import { Tabs } from 'expo-router';
import { useSelector } from 'react-redux';
import { Text } from 'react-native';

export default function TabsLayout() {
  const { user } = useSelector((state) => state.auth);
  const isParent = user && user.isParent;

  return (
    <Tabs screenOptions={{ headerShown: false }}>
      {isParent ? (
        // Parent tabs
        <>
          <Tabs.Screen 
            name="index" 
            options={{ 
              tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🏠</Text>,
              tabBarLabel: 'Home',
              title: 'Parent Dashboard'
            }} 
          />
          <Tabs.Screen 
            name="chores" 
            options={{ 
              tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>📋</Text>,
              tabBarLabel: 'Chores',
              title: 'Manage Chores'
            }} 
          />
          <Tabs.Screen 
            name="rewards" 
            options={{ 
              tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🎁</Text>,
              tabBarLabel: 'Rewards',
              title: 'Manage Rewards'
            }} 
          />
          <Tabs.Screen 
            name="wallet" 
            options={{ 
              tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>💰</Text>,
              tabBarLabel: 'Wallet',
              title: 'Family Wallet'
            }} 
          />
          <Tabs.Screen 
            name="settings" 
            options={{ 
              tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>⚙️</Text>,
              tabBarLabel: 'Settings',
              title: 'Settings'
            }} 
          />
        </>
      ) : (
        // Child tabs
        <>
          <Tabs.Screen 
            name="index" 
            options={{ 
              tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🏠</Text>,
              tabBarLabel: 'Home',
              title: 'My Dashboard'
            }} 
          />
          <Tabs.Screen 
            name="my-chores" 
            options={{ 
              tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>📋</Text>,
              tabBarLabel: 'My Chores',
              title: 'My Chores'
            }} 
          />
          <Tabs.Screen 
            name="shop" 
            options={{ 
              tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🎁</Text>,
              tabBarLabel: 'Reward Shop',
              title: 'Reward Shop'
            }} 
          />
          <Tabs.Screen 
            name="progress" 
            options={{ 
              tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>📈</Text>,
              tabBarLabel: 'Progress',
              title: 'My Progress'
            }} 
          />
        </>
      )}
    </Tabs>
  );
}