import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Header } from '../../components/common/Header';
import { Card } from '../../components/common/Card';
import { fetchChildren } from '../../store/slices/childrenSlice';
import { fetchChores } from '../../store/slices/choresSlice';
import { fetchWalletBalance } from '../../store/slices/walletSlice';

const ParentDashboard = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { children, loading: childrenLoading } = useSelector((state) => state.children);
  const { chores, loading: choresLoading } = useSelector((state) => state.chores);
  const { balance, loading: walletLoading } = useSelector((state) => state.wallet);

  useEffect(() => {
    if (user) {
      dispatch(fetchChildren(user.uid));
      dispatch(fetchChores({ parentId: user.uid }));
      dispatch(fetchWalletBalance(user.uid));
    }
  }, [dispatch, user]);

  const handleAddChildPress = () => {
    navigation.navigate('AddChildProfile');
  };

  const handleManageChoresPress = () => {
    navigation.navigate('ManageChores');
  };

  const handleManageRewardsPress = () => {
    navigation.navigate('ManageRewards');
  };

  const handleAnalyticsPress = () => {
    navigation.navigate('Analytics');
  };

  const handleChildPress = (child) => {
    navigation.navigate('ChildHome', { childId: child.id });
  };

  const getPendingChoreCount = (childId) => {
    return Object.values(chores).filter(
      (chore) => chore.assignedTo === childId && chore.status === 'pending'
    ).length;
  };

  const getOverdueChoreCount = (childId) => {
    return Object.values(chores).filter(
      (chore) => chore.assignedTo === childId && chore.status === 'overdue'
    ).length;
  };

  const renderChildCards = () => {
    if (childrenLoading) {
      return <Text style={styles.loadingText}>Loading children profiles...</Text>;
    }

    if (Object.keys(children).length === 0) {
      return (
        <Card style={styles.emptyCard}>
          <Text style={styles.emptyText}>
            No children profiles added yet. Add your first child to get started!
          </Text>
          <TouchableOpacity 
            style={styles.addButton} 
            onPress={handleAddChildPress}
          >
            <Text style={styles.addButtonText}>Add Child</Text>
          </TouchableOpacity>
        </Card>
      );
    }

    return Object.values(children).map((child) => (
      <TouchableOpacity key={child.id} onPress={() => handleChildPress(child)}>
        <Card style={styles.childCard}>
          <View style={styles.childInfo}>
            <Text style={styles.childName}>{child.name}</Text>
            <Text style={styles.childAge}>{child.age} years old</Text>
            <Text style={styles.childPoints}>{child.points} points</Text>
          </View>
          <View style={styles.choreStatus}>
            <Text style={styles.statusText}>
              {getPendingChoreCount(child.id)} pending chores
            </Text>
            {getOverdueChoreCount(child.id) > 0 && (
              <Text style={styles.overdueText}>
                {getOverdueChoreCount(child.id)} overdue
              </Text>
            )}
          </View>
        </Card>
      </TouchableOpacity>
    ));
  };

  return (
    <View style={styles.container}>
      <Header 
        title="Parent Dashboard" 
        rightComponent={
          <TouchableOpacity onPress={() => console.log('Settings pressed')}>
            <Text style={styles.settingsButton}>⚙️</Text>
          </TouchableOpacity>
        } 
      />
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Children</Text>
          {renderChildCards()}
          
          <TouchableOpacity 
            style={styles.addChildButton} 
            onPress={handleAddChildPress}
          >
            <Text style={styles.addButtonText}>+ Add Child</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={handleManageChoresPress}
            >
              <Text style={styles.actionButtonText}>Manage Chores</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={handleManageRewardsPress}
            >
              <Text style={styles.actionButtonText}>Manage Rewards</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={handleAnalyticsPress}
            >
              <Text style={styles.actionButtonText}>View Analytics</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Family Wallet</Text>
          <Card style={styles.walletCard}>
            <Text style={styles.walletBalance}>
              ${((balance || 0) / 100).toFixed(2)}
            </Text>
            <Text style={styles.walletLabel}>Available Balance</Text>
          </Card>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  loadingText: {
    textAlign: 'center',
    marginVertical: 20,
    color: '#666',
  },
  childCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  childInfo: {
    flex: 1,
  },
  childName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
  },
  childAge: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  childPoints: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4E67F0',
  },
  choreStatus: {
    alignItems: 'flex-end',
  },
  statusText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  overdueText: {
    fontSize: 14,
    color: '#F44336',
    fontWeight: '500',
  },
  emptyCard: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 16,
  },
  addButton: {
    backgroundColor: '#4E67F0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  addChildButton: {
    backgroundColor: '#4E67F0',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  actionButton: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 8,
    width: '48%',
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4E67F0',
  },
  walletCard: {
    padding: 20,
    alignItems: 'center',
  },
  walletBalance: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  walletLabel: {
    fontSize: 14,
    color: '#666',
  },
  settingsButton: {
    fontSize: 24,
  },
});

export default ParentDashboard;