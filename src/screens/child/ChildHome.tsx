import React, { useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  SafeAreaView, 
  StatusBar
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { AppState } from '../../types';
import { theme } from '../../constants/theme';
import ChildDashboard from '../../components/child/ChildDashboard';
import { fetchChildProfile } from '../../store/slices/childrenSlice';

const ChildHome: React.FC = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: AppState) => state.auth);
  const { selectedChildId } = useSelector((state: AppState) => state.children);

  useEffect(() => {
    if (selectedChildId) {
      dispatch(fetchChildProfile(selectedChildId));
    }
  }, [dispatch, selectedChildId]);

  if (!user || !selectedChildId) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        backgroundColor={theme.colors.background}
        barStyle="dark-content"
      />
      <View style={styles.content}>
        <ChildDashboard childId={selectedChildId} />
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

export default ChildHome;
