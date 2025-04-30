import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function WalletTab() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Family Wallet</Text>
      <Text style={styles.subtitle}>Manage your family's rewards points and transactions</Text>
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