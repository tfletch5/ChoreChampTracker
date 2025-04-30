import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter, Redirect } from 'expo-router';
import { useSelector } from 'react-redux';

export default function Index() {
  const router = useRouter();
  const { user, loading } = useSelector(state => state.auth);

  // Check if user is authenticated and redirect accordingly
  useEffect(() => {
    if (!loading) {
      if (user) {
        router.replace('/tabs');
      } else {
        router.replace('/auth/login');
      }
    }
  }, [user, loading]);

  // Show loading screen while checking authentication status
  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.appName}>ChoreChamp</Text>
        <ActivityIndicator size="large" color="#4E67F0" style={styles.loader} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Return redirect (this will happen immediately after the initial render)
  return user ? <Redirect href="/tabs" /> : <Redirect href="/auth/login" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    padding: 20,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4E67F0',
    marginBottom: 20,
  },
  loader: {
    marginVertical: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
});