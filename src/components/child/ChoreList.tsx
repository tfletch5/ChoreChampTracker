import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppState, Chore } from '../../types';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';
import { theme } from '../../constants/theme';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { fetchChoresByChildId, completeChore } from '../../store/slices/choresSlice';
import { incrementPoints, updateStreak } from '../../store/slices/childrenSlice';
import { createAppNotification } from '../../services/messaging';

interface ChoreListProps {
  childId: string;
  filter?: 'all' | 'pending' | 'completed' | 'overdue';
}

const ChoreList: React.FC<ChoreListProps> = ({ childId, filter = 'all' }) => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { user } = useSelector((state: AppState) => state.auth);
  const { chores, loading } = useSelector((state: AppState) => state.chores);
  const { children } = useSelector((state: AppState) => state.children);
  
  const [filteredChores, setFilteredChores] = useState<Chore[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>(filter);
  const [refreshing, setRefreshing] = useState(false);
  
  const childProfile = children[childId];

  useEffect(() => {
    if (user?.uid && childId) {
      loadChores();
    }
  }, [dispatch, user?.uid, childId]);

  useEffect(() => {
    filterChores(activeFilter);
  }, [chores, activeFilter]);

  const loadChores = async () => {
    setRefreshing(true);
    await dispatch(fetchChoresByChildId(childId));
    setRefreshing(false);
  };

  const filterChores = (filterType: string) => {
    const allChores = Object.values(chores).filter(chore => chore.assignedTo === childId);
    let filtered;
    
    switch (filterType) {
      case 'pending':
        filtered = allChores.filter(chore => chore.status === 'pending');
        break;
      case 'completed':
        filtered = allChores.filter(chore => chore.status === 'completed');
        break;
      case 'overdue':
        filtered = allChores.filter(chore => chore.status === 'overdue');
        break;
      default:
        filtered = allChores;
        break;
    }
    
    // Sort by due date (oldest first)
    filtered.sort((a, b) => a.dueDate - b.dueDate);
    
    setFilteredChores(filtered);
  };

  const handleChorePress = (chore: Chore) => {
    navigation.navigate('ChoreDetails' as never, { chore } as never);
  };

  const handleCompleteChore = async (chore: Chore) => {
    try {
      // Update chore status
      await dispatch(completeChore({
        id: chore.id,
        completedAt: Date.now()
      }));
      
      // Add points to child's profile
      await dispatch(incrementPoints({
        childId,
        points: chore.pointValue
      }));
      
      // Update streak
      await dispatch(updateStreak({ childId }));
      
      // Create notification
      await createAppNotification(
        'Chore Completed',
        `${childProfile.name} completed ${chore.title} and earned ${chore.pointValue} points!`,
        'chore',
        { choreId: chore.id, childId },
        user?.uid
      );
      
      Alert.alert(
        'Great Job!',
        `You earned ${chore.pointValue} points for completing this chore.`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to complete chore');
    }
  };

  const renderFilterTab = (name: string, value: string) => (
    <TouchableOpacity
      style={[styles.filterTab, activeFilter === value && styles.activeFilterTab]}
      onPress={() => setActiveFilter(value)}
    >
      <Text style={[styles.filterText, activeFilter === value && styles.activeFilterText]}>
        {name}
      </Text>
    </TouchableOpacity>
  );

  const renderChoreStatus = (status: string) => {
    let type: 'primary' | 'success' | 'warning' | 'error' = 'primary';
    
    switch (status) {
      case 'completed':
        type = 'success';
        break;
      case 'overdue':
        type = 'error';
        break;
      case 'pending':
        type = 'primary';
        break;
      default:
        type = 'primary';
    }
    
    return (
      <Badge 
        label={status.charAt(0).toUpperCase() + status.slice(1)} 
        type={type}
        size="small"
      />
    );
  };

  const formatDueDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date >= today && date < tomorrow) {
      return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date >= tomorrow && date < new Date(tomorrow).setDate(tomorrow.getDate() + 1)) {
      return `Tomorrow, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date >= yesterday && date < today) {
      return `Yesterday, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return `${date.toLocaleDateString()}, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
  };

  const renderChoreItem = ({ item }: { item: Chore }) => (
    <Card key={item.id} style={styles.choreCard} onPress={() => handleChorePress(item)}>
      <View style={styles.choreHeader}>
        <Text style={styles.choreTitle}>{item.title}</Text>
        {renderChoreStatus(item.status)}
      </View>
      
      {item.description ? (
        <Text style={styles.choreDescription} numberOfLines={2}>
          {item.description}
        </Text>
      ) : null}
      
      <View style={styles.choreDetails}>
        <View style={styles.choreStat}>
          <Feather name="clock" size={16} color={theme.colors.textSecondary} />
          <Text style={styles.choreStatText}>Due: {formatDueDate(item.dueDate)}</Text>
        </View>
        
        <View style={styles.choreStat}>
          <Feather name="award" size={16} color={theme.colors.primary} />
          <Text style={styles.choreStatText}>{item.pointValue} points</Text>
        </View>
      </View>
      
      {item.status === 'pending' && (
        <Button
          title="Mark Completed"
          onPress={() => handleCompleteChore(item)}
          type="primary"
          size="small"
          style={styles.completeButton}
          icon={<Feather name="check" size={16} color="#fff" style={{ marginRight: 8 }} />}
        />
      )}
    </Card>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading chores...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.filtersContainer}>
        {renderFilterTab('All', 'all')}
        {renderFilterTab('Pending', 'pending')}
        {renderFilterTab('Completed', 'completed')}
        {renderFilterTab('Overdue', 'overdue')}
      </View>
      
      {filteredChores.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Feather name="check-circle" size={50} color={theme.colors.textSecondary} />
          <Text style={styles.emptyText}>
            {activeFilter === 'all'
              ? 'No chores assigned yet'
              : activeFilter === 'pending'
              ? 'No pending chores'
              : activeFilter === 'completed'
              ? 'No completed chores yet'
              : 'No overdue chores'}
          </Text>
          {activeFilter === 'pending' && filteredChores.length === 0 && (
            <Text style={styles.emptySubtext}>Enjoy your free time!</Text>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredChores}
          renderItem={renderChoreItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          onRefresh={loadChores}
          refreshing={refreshing}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  filtersContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    zIndex: 1,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeFilterTab: {
    borderBottomColor: theme.colors.primary,
  },
  filterText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  activeFilterText: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
    paddingBottom: 24,
  },
  choreCard: {
    marginBottom: 12,
  },
  choreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  choreTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    flex: 1,
  },
  choreDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 12,
  },
  choreDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  choreStat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  choreStatText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginLeft: 6,
  },
  completeButton: {
    alignSelf: 'flex-end',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.textSecondary,
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
});

export default ChoreList;
