import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  StatusBar, 
  TouchableOpacity 
} from 'react-native';
import { useSelector } from 'react-redux';
import { AppState } from '../../types';
import { theme } from '../../constants/theme';
import ProgressTracker from '../../components/child/ProgressTracker';
import { Feather } from '@expo/vector-icons';

const ChildProgress: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { selectedChildId } = useSelector((state: AppState) => state.children);

  const handleGoBack = () => {
    navigation.goBack();
  };

  if (!selectedChildId) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        backgroundColor={theme.colors.background}
        barStyle="dark-content"
      />
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Progress</Text>
        <View style={styles.placeholder} />
      </View>
      <ProgressTracker childId={selectedChildId} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  placeholder: {
    width: 40,
  },
});

export default ChildProgress;
