import React, { useState } from 'react';
import { 
  View, 
  StyleSheet, 
  SafeAreaView, 
  StatusBar
} from 'react-native';
import { useSelector } from 'react-redux';
import { AppState } from '../../types';
import { theme } from '../../constants/theme';
import ParentDashboard from '../../components/parent/ParentDashboard';

const ParentHome: React.FC = () => {
  const { user } = useSelector((state: AppState) => state.auth);

  if (!user) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        backgroundColor={theme.colors.background}
        barStyle="dark-content"
      />
      <View style={styles.content}>
        <ParentDashboard />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
  },
});

export default ParentHome;
