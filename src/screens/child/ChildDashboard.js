import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Header } from '../../components/common/Header';
import { Card } from '../../components/common/Card';
import { fetchChores } from '../../store/slices/choresSlice';
import { fetchRewards } from '../../store/slices/rewardsSlice';

const ChildDashboard = ({ route, navigation }) => {
  const dispatch = useDispatch();
  const { childId } = route.params || {};
  
  const { user } = useSelector((state) => state.auth);
  const { children } = useSelector((state) => state.children);
  const { chores } = useSelector((state) => state.chores);
  
  const child = children[childId];

  useEffect(() => {
    if (childId) {
      dispatch(fetchChores({ childId }));
    }
    if (user && user.isParent) {
      dispatch(fetchRewards(user.uid));
    }
  }, [dispatch, childId, user]);

  const handleChorePress = (chore) => {
    navigation.navigate('ChoreDetails', { chore });
  };

  const handleRewardShopPress = () => {
    navigation.navigate('RewardShop', { childId });
  };

  const handleProgressPress = () => {
    navigation.navigate('ChildProgress', { childId });
  };

  const getPendingChores = () => {
    return Object.values(chores).filter(
      (chore) => chore.assignedTo === childId && chore.status === 'pending'
    );
  };

  const getOverdueChores = () => {
    return Object.values(chores).filter(
      (chore) => chore.assignedTo === childId && chore.status === 'overdue'
    );
  };

  if (!child) {
    return (
      <View style={styles.container}>
        <Header 
          title="Child Dashboard"
          showBackButton={true}
          onBackPress={() => navigation.goBack()}
        />
        <View style={styles.centerContainer}>
          <Text>Child profile not found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header 
        title={`${child.name}'s Dashboard`}
        showBackButton={user && user.isParent}
        onBackPress={() => navigation.goBack()}
      />
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatar}>{child.avatar || '👧'}</Text>
          </View>
          <Text style={styles.childName}>{child.name}</Text>
          <Text style={styles.childPoints}>{child.points} points</Text>
          <Text style={styles.childStreak}>{child.streakCount} day streak 🔥</Text>
        </View>
        
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Chores</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {getPendingChores().length === 0 ? (
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyText}>No pending chores for today! 🎉</Text>
            </Card>
          ) : (
            getPendingChores().slice(0, 3).map((chore) => (
              <TouchableOpacity key={chore.id} onPress={() => handleChorePress(chore)}>
                <Card style={styles.choreCard}>
                  <View style={styles.choreInfo}>
                    <Text style={styles.choreTitle}>{chore.title}</Text>
                    <Text style={styles.chorePoints}>+{chore.pointValue} points</Text>
                  </View>
                  <View style={styles.choreStatus}>
                    <View style={styles.statusBadge}>
                      <Text style={styles.statusText}>To Do</Text>
                    </View>
                  </View>
                </Card>
              </TouchableOpacity>
            ))
          )}
        </View>
        
        {getOverdueChores().length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Overdue Chores</Text>
            </View>
            
            {getOverdueChores().slice(0, 2).map((chore) => (
              <TouchableOpacity key={chore.id} onPress={() => handleChorePress(chore)}>
                <Card style={styles.choreCard}>
                  <View style={styles.choreInfo}>
                    <Text style={styles.choreTitle}>{chore.title}</Text>
                    <Text style={styles.chorePoints}>+{chore.pointValue} points</Text>
                  </View>
                  <View style={styles.choreStatus}>
                    <View style={[styles.statusBadge, styles.overdueBadge]}>
                      <Text style={styles.overdueText}>Overdue</Text>
                    </View>
                  </View>
                </Card>
              </TouchableOpacity>
            ))}
          </View>
        )}
        
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleRewardShopPress}
          >
            <Text style={styles.actionButtonIcon}>🎁</Text>
            <Text style={styles.actionButtonText}>Reward Shop</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleProgressPress}
          >
            <Text style={styles.actionButtonIcon}>📈</Text>
            <Text style={styles.actionButtonText}>My Progress</Text>
          </TouchableOpacity>
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
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#4E67F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatar: {
    fontSize: 50,
  },
  childName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
  },
  childPoints: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4E67F0',
    marginBottom: 4,
  },
  childStreak: {
    fontSize: 16,
    color: '#F86F6F',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAllText: {
    fontSize: 14,
    color: '#4E67F0',
  },
  emptyCard: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
  },
  choreCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  choreInfo: {
    flex: 1,
  },
  choreTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#333',
  },
  chorePoints: {
    fontSize: 14,
    color: '#4E67F0',
  },
  choreStatus: {},
  statusBadge: {
    backgroundColor: '#E1E9FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: '#4E67F0',
    fontSize: 12,
    fontWeight: '600',
  },
  overdueBadge: {
    backgroundColor: '#FFECEC',
  },
  overdueText: {
    color: '#F44336',
    fontSize: 12,
    fontWeight: '600',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  actionButton: {
    backgroundColor: '#FFFFFF',
    width: 150,
    height: 120,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionButtonIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
});

export default ChildDashboard;