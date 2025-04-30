import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  StatusBar, 
  TouchableOpacity 
} from 'react-native';
import { theme } from '../../constants/theme';
import ChildProfileForm from '../../components/parent/ChildProfileForm';
import { Feather } from '@expo/vector-icons';

const AddChildProfile: React.FC<{ navigation: any }> = ({ navigation }) => {
  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleSuccess = () => {
    navigation.goBack();
  };

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
        <Text style={styles.headerTitle}>Add Child Profile</Text>
        <View style={styles.placeholder} />
      </View>
      <ChildProfileForm onSuccess={handleSuccess} />
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

export default AddChildProfile;
