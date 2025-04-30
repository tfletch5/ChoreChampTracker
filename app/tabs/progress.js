import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ProgressTab() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Progress</Text>
      <Text style={styles.subtitle}>Track your achievements and chore completion</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F5F7FA',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#4E67F0',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
  },
});