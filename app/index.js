import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter, Redirect } from 'expo-router';
import { useSelector } from 'react-redux';

export default function Index() {
  const router = useRouter();
  const { user, loading } = useSelector((state) => state.auth);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4E67F0" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Route based on authentication status
  if (!user) {
    return <Redirect href="/auth/login" />;
  }

  // Route to appropriate dashboard based on user role
  if (user.isParent) {
    return <Redirect href="/tabs" />;
  } else {
    return <Redirect href="/tabs" />;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
});