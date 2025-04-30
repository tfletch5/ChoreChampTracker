import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';

export default function TabIndex() {
  const { user } = useSelector((state) => state.auth);
  const isParent = user && user.isParent;
  
  // Placeholder dashboard until we fully implement the screens
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {isParent ? 'Parent Dashboard' : 'Child Dashboard'}
      </Text>
      <Text style={styles.subtitle}>
        {isParent ? 'Manage your family chores and rewards' : 'View your chores and rewards'}
      </Text>
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