import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppState, Chore, ChildProfile } from '../../types';
import Card from '../common/Card';
import ProgressBar from '../common/ProgressBar';
import Button from '../common/Button';
import Badge from '../common/Badge';
import { theme } from '../../constants/theme';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { fetchChoresByChildId } from '../../store/slices/choresSlice';
import { fetchChildProfile } from '../../store/slices/childrenSlice';

interface ChildDashboardProps {
  childId: string;
}

const ChildDashboard: React.FC<ChildDashboardProps> = ({ childId }) => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { user } = useSelector((state: AppState) => state.auth);
  const { children } = useSelector((state: AppState) => state.children);
  const { chores } = useSelector((state: AppState) => state.chores);
  const { rewards } = useSelector((state: AppState) => state.rewards);
  
  const [todayChores, setTodayChores] = useState<Chore[]>([]);
  const [upcomingChores, setUpcomingChores] = useState<Chore[]>([]);
  const childProfile = children[childId];

  useEffect(() => {
    if (user?.uid && childId) {
      dispatch(fetchChoresByChildId(childId));
      dispatch(fetchChildProfile(childId));
    }
  }, [dispatch, user?.uid, childId]);

  useEffect(() => {
    // Filter and sort chores
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const allChores = Object.values(chores);
    
    // Get today's chores
    const today = allChores.filter(chore => 
      chore.assignedTo === childId && 
      new Date(chore.dueDate) >= now && 
      new Date(chore.dueDate) < tomorrow
    ).sort((a, b) => a.dueDate - b.dueDate);
    
    // Get upcoming chores (next 7 days, excluding today)
    const weekLater = new Date(now);
    weekLater.setDate(weekLater.getDate() + 7);
    const upcoming = allChores.filter(chore => 
      chore.assignedTo === childId && 
      new Date(chore.dueDate) >= tomorrow && 
      new Date(chore.dueDate) <= weekLater
    ).sort((a, b) => a.dueDate - b.dueDate);
    
    setTodayChores(today);
    setUpcomingChores(upcoming);
  }, [chores, childId]);

  const handleChorePress = (chore: Chore) => {
    navigation.navigate('ChoreDetails' as never, { chore } as never);
  };

  const handleViewAllChores = () => {
    navigation.navigate('ChoreList' as never);
  };

  const handleViewRewards = () => {
    navigation.navigate('RewardShop' as never);
  };

  const handleViewProgress = () => {
    navigation.navigate('ChildProgress' as never);
  };

  const getCompletionRate = () => {
    const allChores = Object.values(chores).filter(chore => chore.assignedTo === childId);
    if (allChores.length === 0) return 0;
    
    const completedChores = allChores.filter(chore => chore.status === 'completed');
    return completedChores.length / allChores.length;
  };

  // Get chore status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return theme.colors.success;
      case 'overdue':
        return theme.colors.error;
      default:
        return theme.colors.primary;
    }
  };

  if (!childProfile) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <View style={styles.greeting}>
          <Text style={styles.welcomeText}>
            Hi, <Text style={styles.nameText}>{childProfile.name}</Text>!
          </Text>
          <Text style={styles.subtitleText}>Here's what you have for today</Text>
        </View>
        <View style={styles.pointsContainer}>
          <Text style={styles.pointsLabel}>Your Points</Text>
          <Text style={styles.pointsValue}>{childProfile.points}</Text>
        </View>
      </View>
      
      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.sectionTitle}>Your Progress</Text>
          <TouchableOpacity onPress={handleViewProgress}>
            <Text style={styles.viewAllText}>View Details</Text>
          </TouchableOpacity>
        </View>
        
        <Card style={styles.progressCard}>
          <View style={styles.progressItem}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Completion Rate</Text>
              <Text style={styles.progressValue}>{Math.round(getCompletionRate() * 100)}%</Text>
            </View>
            <ProgressBar 
              progress={getCompletionRate()} 
              height={12}
              progressColor={theme.colors.primary}
            />
          </View>
          
          <View style={styles.streakContainer}>
            <Feather name="zap" size={24} color={theme.colors.warning} />
            <View style={styles.streakInfo}>
              <Text style={styles.streakValue}>{childProfile.streakCount} day streak</Text>
              <Text style={styles.streakLabel}>Keep it going!</Text>
            </View>
          </View>
        </Card>
      </View>
      
      <View style={styles.todaySection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Chores</Text>
          <TouchableOpacity onPress={handleViewAllChores}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        
        {todayChores.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Feather name="sun" size={40} color={theme.colors.textSecondary} />
            <Text style={styles.emptyText}>No chores for today!</Text>
            <Text style={styles.emptySubtext}>Enjoy your free time</Text>
          </Card>
        ) : (
          todayChores.map((chore) => (
            <Card key={chore.id} style={styles.choreCard} onPress={() => handleChorePress(chore)}>
              <View style={styles.choreHeader}>
                <Text style={styles.choreTitle}>{chore.title}</Text>
                <Badge 
                  label={chore.status.charAt(0).toUpperCase() + chore.status.slice(1)}
                  type={
                    chore.status === 'completed' ? 'success' : 
                    chore.status === 'overdue' ? 'error' : 'primary'
                  }
                  size="small"
                />
              </View>
              <View style={styles.choreDetails}>
                <Text style={styles.choreDescription} numberOfLines={2}>
                  {chore.description || 'No description provided'}
                </Text>
                <View style={styles.choreFooter}>
                  <View style={styles.pointsTag}>
                    <Feather name="award" size={14} color={theme.colors.primary} />
                    <Text style={styles.pointsText}>{chore.pointValue} points</Text>
                  </View>
                  <Text style={styles.timeText}>
                    {new Date(chore.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
              </View>
            </Card>
          ))
        )}
      </View>
      
      <View style={styles.upcomingSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Coming Up</Text>
        </View>
        
        {upcomingChores.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Feather name="calendar" size={40} color={theme.colors.textSecondary} />
            <Text style={styles.emptyText}>No upcoming chores</Text>
            <Text style={styles.emptySubtext}>Check back later</Text>
          </Card>
        ) : (
          <ScrollView 
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.upcomingChoresContainer}
          >
            {upcomingChores.map((chore) => (
              <Card key={chore.id} style={styles.upcomingChoreCard} onPress={() => handleChorePress(chore)}>
                <View style={styles.upcomingChoreDate}>
                  <Text style={styles.upcomingDay}>
                    {new Date(chore.dueDate).toLocaleDateString([], { weekday: 'short' })}
                  </Text>
                  <Text style={styles.upcomingDayNum}>
                    {new Date(chore.dueDate).getDate()}
                  </Text>
                </View>
                <Text style={styles.upcomingChoreTitle} numberOfLines={2}>{chore.title}</Text>
                <View style={styles.upcomingChorePoints}>
                  <Feather name="award" size={14} color={theme.colors.warning} />
                  <Text style={styles.upcomingPointsText}>{chore.pointValue}</Text>
                </View>
              </Card>
            ))}
          </ScrollView>
        )}
      </View>
      
      <View style={styles.rewardsSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Rewards</Text>
          <TouchableOpacity onPress={handleViewRewards}>
            <Text style={styles.viewAllText}>Go Shopping</Text>
          </TouchableOpacity>
        </View>
        
        <Card style={styles.rewardsCard}>
          <View style={styles.rewardsHeader}>
            <Feather name="gift" size={30} color={theme.colors.primary} />
            <View style={styles.rewardsInfo}>
              <Text style={styles.rewardsTitle}>Reward Shop</Text>
              <Text style={styles.rewardsSubtitle}>
                You have {childProfile.points} points to spend
              </Text>
            </View>
          </View>
          <Button
            title="View Rewards"
            onPress={handleViewRewards}
            type="primary"
            icon={<Feather name="shopping-bag" size={16} color="#fff" style={{ marginRight: 8 }} />}
          />
        </Card>
      </View>
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
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 20,
    color: theme.colors.text,
    marginBottom: 4,
  },
  nameText: {
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  subtitleText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  pointsContainer: {
    backgroundColor: theme.colors.primaryLight,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  pointsLabel: {
    fontSize: 12,
    color: theme.colors.primary,
    marginBottom: 4,
  },
  pointsValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  progressSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  viewAllText: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '500',
  },
  progressCard: {
    padding: 16,
  },
  progressItem: {
    marginBottom: 16,
  },
  progressLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  progressValue: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.primary,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.warningLight,
    borderRadius: 8,
    padding: 12,
  },
  streakInfo: {
    marginLeft: 12,
  },
  streakValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.warning,
  },
  streakLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  todaySection: {
    marginBottom: 24,
  },
  emptyCard: {
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.textSecondary,
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  choreCard: {
    marginBottom: 10,
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
  choreDetails: {
    flex: 1,
  },
  choreDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 8,
  },
  choreFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pointsTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primaryLight,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  pointsText: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.primary,
    marginLeft: 4,
  },
  timeText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  upcomingSection: {
    marginBottom: 24,
  },
  upcomingChoresContainer: {
    paddingBottom: 8,
    paddingRight: 16,
  },
  upcomingChoreCard: {
    width: 120,
    height: 140,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  upcomingChoreDate: {
    alignItems: 'center',
    marginBottom: 8,
  },
  upcomingDay: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  upcomingDayNum: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  upcomingChoreTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  upcomingChorePoints: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.warningLight,
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  upcomingPointsText: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.warning,
    marginLeft: 4,
  },
  rewardsSection: {
    marginBottom: 24,
  },
  rewardsCard: {
    padding: 16,
  },
  rewardsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  rewardsInfo: {
    marginLeft: 12,
    flex: 1,
  },
  rewardsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  rewardsSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
});

export default ChildDashboard;
