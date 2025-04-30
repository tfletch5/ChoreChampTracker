import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { AppState, ChildProfile, Chore } from '../../types';
import Card from '../common/Card';
import ProgressBar from '../common/ProgressBar';
import Avatar from '../common/Avatar';
import Button from '../common/Button';
import { theme } from '../../constants/theme';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { fetchChildren } from '../../store/slices/childrenSlice';
import { fetchChores } from '../../store/slices/choresSlice';
import { fetchWalletBalance } from '../../store/slices/walletSlice';
import { formatCurrency } from '../../utils/formatters';
import { setSelectedChild } from '../../store/slices/childrenSlice';

const ParentDashboard: React.FC = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useSelector((state: AppState) => state.auth);
  const { children, loading: childrenLoading } = useSelector((state: AppState) => state.children);
  const { chores, loading: choresLoading } = useSelector((state: AppState) => state.chores);
  const { balance, loading: walletLoading } = useSelector((state: AppState) => state.wallet);

  // Convert children object to array for easier rendering
  const childrenArray = Object.values(children);

  useEffect(() => {
    loadData();
  }, [dispatch, user?.uid]);

  const loadData = () => {
    if (user?.uid) {
      dispatch(fetchChildren(user.uid));
      dispatch(fetchChores(user.uid));
      dispatch(fetchWalletBalance(user.uid));
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Get today's chores
  const getTodayChores = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return Object.values(chores).filter(chore => {
      const dueDate = new Date(chore.dueDate);
      return dueDate >= today && dueDate < tomorrow;
    });
  };

  // Get chores by child
  const getChildChores = (childId: string) => {
    return Object.values(chores).filter(chore => chore.assignedTo === childId);
  };

  // Calculate completion rate for a child
  const getChildCompletionRate = (childId: string) => {
    const childChores = getChildChores(childId);
    if (childChores.length === 0) return 0;
    
    const completedChores = childChores.filter(chore => chore.status === 'completed');
    return completedChores.length / childChores.length;
  };

  // Navigate to child details
  const handleChildPress = (child: ChildProfile) => {
    dispatch(setSelectedChild(child.id));
    navigation.navigate('ChildDetails' as never);
  };

  // Navigate to add child profile
  const handleAddChild = () => {
    navigation.navigate('AddChildProfile' as never);
  };

  // Navigate to add chore
  const handleAddChore = () => {
    navigation.navigate('ManageChores' as never, { mode: 'add' } as never);
  };

  // Navigate to wallet
  const handleWalletPress = () => {
    navigation.navigate('Wallet' as never);
  };

  // Render children summary cards
  const renderChildrenSummary = () => {
    if (childrenArray.length === 0) {
      return (
        <Card style={styles.emptyCard}>
          <Feather name="users" size={40} color={theme.colors.textSecondary} />
          <Text style={styles.emptyText}>No children added yet</Text>
          <Button 
            title="Add Child" 
            onPress={handleAddChild} 
            type="primary" 
            size="small" 
            icon={<Feather name="plus" size={16} color="#fff" style={{ marginRight: 8 }} />}
          />
        </Card>
      );
    }

    return (
      <View>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Children</Text>
          <TouchableOpacity onPress={handleAddChild}>
            <Feather name="plus-circle" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.childrenContainer}
        >
          {childrenArray.map(child => (
            <Card key={child.id} style={styles.childCard} onPress={() => handleChildPress(child)}>
              <Avatar 
                source={child.avatarURL} 
                size={60} 
                initials={child.name.substring(0, 2)}
                borderColor={theme.colors.primary}
                borderWidth={2}
              />
              <Text style={styles.childName}>{child.name}</Text>
              <Text style={styles.childPoints}>{child.points} points</Text>
              <View style={styles.completionContainer}>
                <ProgressBar 
                  progress={getChildCompletionRate(child.id)} 
                  height={8} 
                  label="Completion rate"
                />
              </View>
              <View style={styles.streakContainer}>
                <Feather name="zap" size={16} color={theme.colors.warning} />
                <Text style={styles.streakText}>{child.streakCount} day streak</Text>
              </View>
            </Card>
          ))}
        </ScrollView>
      </View>
    );
  };

  // Render today's chores
  const renderTodayChores = () => {
    const todayChores = getTodayChores();
    
    return (
      <View>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Chores</Text>
          <TouchableOpacity onPress={handleAddChore}>
            <Feather name="plus-circle" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
        
        {todayChores.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Feather name="check-circle" size={40} color={theme.colors.textSecondary} />
            <Text style={styles.emptyText}>No chores for today</Text>
            <Button 
              title="Add Chore" 
              onPress={handleAddChore} 
              type="primary" 
              size="small" 
              icon={<Feather name="plus" size={16} color="#fff" style={{ marginRight: 8 }} />}
            />
          </Card>
        ) : (
          <View style={styles.choresContainer}>
            {todayChores.map(chore => {
              const assignedChild = children[chore.assignedTo];
              return (
                <Card key={chore.id} style={styles.choreCard}>
                  <View style={styles.choreHeader}>
                    <Text style={styles.choreTitle}>{chore.title}</Text>
                    <View style={[styles.choreStatus, 
                      chore.status === 'completed' ? styles.statusCompleted : 
                      chore.status === 'overdue' ? styles.statusOverdue : styles.statusPending
                    ]}>
                      <Text style={styles.choreStatusText}>
                        {chore.status.charAt(0).toUpperCase() + chore.status.slice(1)}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.choreDetails}>
                    <View style={styles.choreDetail}>
                      <Feather name="user" size={16} color={theme.colors.textSecondary} />
                      <Text style={styles.choreDetailText}>
                        {assignedChild ? assignedChild.name : 'Unknown'}
                      </Text>
                    </View>
                    <View style={styles.choreDetail}>
                      <Feather name="award" size={16} color={theme.colors.textSecondary} />
                      <Text style={styles.choreDetailText}>{chore.pointValue} points</Text>
                    </View>
                  </View>
                </Card>
              );
            })}
          </View>
        )}
      </View>
    );
  };

  // Render wallet summary
  const renderWalletSummary = () => {
    return (
      <Card style={styles.walletCard} onPress={handleWalletPress}>
        <View style={styles.walletHeader}>
          <Text style={styles.walletTitle}>Family Wallet</Text>
          <Feather name="chevron-right" size={24} color={theme.colors.primary} />
        </View>
        <View style={styles.walletBalance}>
          <Text style={styles.walletAmount}>{formatCurrency(balance / 100)}</Text>
          <Text style={styles.walletLabel}>Available Balance</Text>
        </View>
        <Button 
          title="Top Up" 
          onPress={handleWalletPress} 
          type="outline" 
          size="small" 
          icon={<Feather name="plus" size={16} color={theme.colors.primary} style={{ marginRight: 8 }} />}
        />
      </Card>
    );
  };

  const isLoading = childrenLoading || choresLoading || walletLoading;

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>
          Hello, {user?.displayName?.split(' ')[0] || 'Parent'}
        </Text>
        <Text style={styles.subGreeting}>Here's your family dashboard</Text>
      </View>
      
      {renderWalletSummary()}
      {renderChildrenSummary()}
      {renderTodayChores()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  contentContainer: {
    padding: 16,
  },
  header: {
    marginBottom: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  subGreeting: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  childrenContainer: {
    paddingRight: 16,
  },
  childCard: {
    width: 160,
    alignItems: 'center',
    padding: 16,
    marginRight: 12,
  },
  childName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 12,
    color: theme.colors.text,
  },
  childPoints: {
    fontSize: 14,
    color: theme.colors.primary,
    marginTop: 4,
    marginBottom: 8,
  },
  completionContainer: {
    width: '100%',
    marginVertical: 8,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  streakText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginLeft: 4,
  },
  choresContainer: {
    marginBottom: 20,
  },
  choreCard: {
    marginBottom: 10,
  },
  choreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  choreTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    flex: 1,
  },
  choreStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  statusPending: {
    backgroundColor: theme.colors.infoLight,
  },
  statusCompleted: {
    backgroundColor: theme.colors.successLight,
  },
  statusOverdue: {
    backgroundColor: theme.colors.errorLight,
  },
  choreStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  choreDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  choreDetail: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  choreDetailText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginLeft: 6,
  },
  emptyCard: {
    alignItems: 'center',
    padding: 20,
    marginVertical: 10,
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginVertical: 10,
  },
  walletCard: {
    marginBottom: 20,
  },
  walletHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  walletTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  walletBalance: {
    marginBottom: 16,
  },
  walletAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  walletLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
});

export default ParentDashboard;
