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
import RewardStore from '../../components/child/RewardStore';
import { Feather } from '@expo/vector-icons';

const RewardShop: React.FC<{ navigation: any }> = ({ navigation }) => {
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
        backgroundColor={theme.colors.primary}
        barStyle="light-content"
      />
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reward Shop</Text>
        <View style={styles.placeholder} />
      </View>
      <RewardStore childId={selectedChildId} />
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
    backgroundColor: theme.colors.primary,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  placeholder: {
    width: 40,
  },
});

export default RewardShop;
