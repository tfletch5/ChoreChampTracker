import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppState, ChildProfile, ChildAnalytics } from '../../types';
import Card from '../common/Card';
import ProgressBar from '../common/ProgressBar';
import Avatar from '../common/Avatar';
import { theme } from '../../constants/theme';
import { Feather } from '@expo/vector-icons';
import { fetchChildAnalytics } from '../../store/slices/analyticsSlice';
import { Picker } from '@react-native-picker/picker';

const AnalyticsDashboard: React.FC = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: AppState) => state.auth);
  const { children } = useSelector((state: AppState) => state.children);
  const { childAnalytics, loading: analyticsLoading } = useSelector((state: AppState) => state.analytics);
  const [selectedChild, setSelectedChild] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'allTime'>('week');
  
  const childrenArray = Object.values(children);
  const analyticsArray = Object.values(childAnalytics);

  useEffect(() => {
    if (user?.uid && childrenArray.length > 0) {
      if (!selectedChild) {
        setSelectedChild(childrenArray[0].id);
      }
      
      childrenArray.forEach(child => {
        dispatch(fetchChildAnalytics({ childId: child.id, timeRange }));
      });
    }
  }, [dispatch, user?.uid, childrenArray.length, timeRange]);

  const getSelectedChildAnalytics = (): ChildAnalytics | null => {
    if (!selectedChild) return null;
    return analyticsArray.find(analytics => analytics.childId === selectedChild) || null;
  };

  if (analyticsLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading analytics...</Text>
      </View>
    );
  }

  if (childrenArray.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Feather name="bar-chart-2" size={60} color={theme.colors.textSecondary} />
        <Text style={styles.emptyText}>Add children to view analytics</Text>
      </View>
    );
  }

  const analytics = getSelectedChildAnalytics();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Card style={styles.filterCard}>
        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Child:</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedChild}
              onValueChange={(itemValue) => setSelectedChild(itemValue)}
              style={styles.picker}
            >
              {childrenArray.map(child => (
                <Picker.Item key={child.id} label={child.name} value={child.id} />
              ))}
            </Picker>
          </View>
        </View>
        
        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Time Range:</Text>
          <View style={styles.timeRangeButtons}>
            <Text 
              style={[styles.timeRangeButton, timeRange === 'week' && styles.activeTimeRange]}
              onPress={() => setTimeRange('week')}
            >
              Week
            </Text>
            <Text 
              style={[styles.timeRangeButton, timeRange === 'month' && styles.activeTimeRange]}
              onPress={() => setTimeRange('month')}
            >
              Month
            </Text>
            <Text 
              style={[styles.timeRangeButton, timeRange === 'allTime' && styles.activeTimeRange]}
              onPress={() => setTimeRange('allTime')}
            >
              All Time
            </Text>
          </View>
        </View>
      </Card>
      
      {selectedChild && analytics ? (
        <View>
          <Card style={styles.overviewCard}>
            <View style={styles.childHeader}>
              <Avatar 
                source={children[selectedChild]?.avatarURL} 
                size={60} 
                initials={children[selectedChild]?.name.substring(0, 2)}
              />
              <View style={styles.childInfo}>
                <Text style={styles.childName}>{children[selectedChild]?.name}</Text>
                <Text style={styles.childPoints}>{children[selectedChild]?.points} total points</Text>
              </View>
              <View style={styles.streakContainer}>
                <Feather name="zap" size={24} color={theme.colors.warning} />
                <Text style={styles.streakCount}>{analytics.currentStreak}</Text>
                <Text style={styles.streakLabel}>day streak</Text>
              </View>
            </View>
          </Card>
          
          <View style={styles.statsRow}>
            <Card style={styles.statCard}>
              <Text style={styles.statValue}>{analytics.completedChores}</Text>
              <Text style={styles.statLabel}>Completed Chores</Text>
            </Card>
            
            <Card style={styles.statCard}>
              <Text style={styles.statValue}>{Math.round(analytics.completionRate * 100)}%</Text>
              <Text style={styles.statLabel}>Completion Rate</Text>
            </Card>
            
            <Card style={styles.statCard}>
              <Text style={styles.statValue}>{analytics.longestStreak}</Text>
              <Text style={styles.statLabel}>Longest Streak</Text>
            </Card>
          </View>
          
          <Card style={styles.progressCard}>
            <Text style={styles.cardTitle}>Completion Performance</Text>
            
            <View style={styles.progressItem}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>Overall Completion</Text>
                <Text style={styles.progressValue}>{Math.round(analytics.completionRate * 100)}%</Text>
              </View>
              <ProgressBar 
                progress={analytics.completionRate} 
                height={12}
                progressColor={theme.colors.primary}
              />
            </View>
            
            <View style={styles.progressItem}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>On-Time Completion</Text>
                <Text style={styles.progressValue}>
                  {analytics.averageTimeToComplete < 24 ? 'Good' : analytics.averageTimeToComplete < 48 ? 'Average' : 'Needs Improvement'}
                </Text>
              </View>
              <ProgressBar 
                progress={1 - Math.min(1, analytics.averageTimeToComplete / 72)} 
                height={12}
                progressColor={
                  analytics.averageTimeToComplete < 24 ? theme.colors.success : 
                  analytics.averageTimeToComplete < 48 ? theme.colors.warning : 
                  theme.colors.error
                }
              />
            </View>
            
            <View style={styles.progressItem}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>Streak Progress</Text>
                <Text style={styles.progressValue}>{analytics.currentStreak} / {analytics.longestStreak}</Text>
              </View>
              <ProgressBar 
                progress={analytics.longestStreak > 0 ? analytics.currentStreak / analytics.longestStreak : 0} 
                height={12}
                progressColor={theme.colors.warning}
              />
            </View>
          </Card>
          
          <Card style={styles.insightsCard}>
            <Text style={styles.cardTitle}>Insights</Text>
            
            <View style={styles.insightItem}>
              <Feather name="trending-up" size={20} color={theme.colors.success} />
              <Text style={styles.insightText}>
                {analytics.completionRate > 0.75 ? 
                  'Great job! Completion rate is excellent.' : 
                  analytics.completionRate > 0.5 ? 
                    'Good progress, but there\'s room for improvement.' : 
                    'Needs motivation to complete more chores.'}
              </Text>
            </View>
            
            <View style={styles.insightItem}>
              <Feather name="clock" size={20} color={
                analytics.averageTimeToComplete < 24 ? theme.colors.success : 
                analytics.averageTimeToComplete < 48 ? theme.colors.warning : 
                theme.colors.error
              } />
              <Text style={styles.insightText}>
                {analytics.averageTimeToComplete < 24 ? 
                  'Completes chores quickly and efficiently.' : 
                  analytics.averageTimeToComplete < 48 ? 
                    'Takes a reasonable amount of time to complete chores.' : 
                    'Takes longer than average to complete assigned chores.'}
              </Text>
            </View>
            
            <View style={styles.insightItem}>
              <Feather name="zap" size={20} color={theme.colors.warning} />
              <Text style={styles.insightText}>
                {analytics.currentStreak >= 5 ? 
                  `On a ${analytics.currentStreak}-day streak! Keep it up!` : 
                  analytics.currentStreak > 0 ? 
                    `Building a streak of ${analytics.currentStreak} days.` : 
                    'No active streak. Encourage daily chore completion.'}
              </Text>
            </View>
          </Card>
          
          <Text style={styles.lastUpdated}>
            Last updated: {new Date(analytics.lastUpdated).toLocaleString()}
          </Text>
        </View>
      ) : (
        <View style={styles.noAnalyticsContainer}>
          <Feather name="bar-chart-2" size={50} color={theme.colors.textSecondary} />
          <Text style={styles.noAnalyticsText}>No analytics data available yet</Text>
          <Text style={styles.noAnalyticsSubtext}>
            Analytics will appear as chores are completed
          </Text>
        </View>
      )}
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
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  filterCard: {
    marginBottom: 16,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  filterLabel: {
    width: 80,
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
  },
  pickerContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    backgroundColor: '#fff',
    height: 40,
    justifyContent: 'center',
  },
  picker: {
    height: 40,
  },
  timeRangeButtons: {
    flex: 1,
    flexDirection: 'row',
  },
  timeRangeButton: {
    flex: 1,
    textAlign: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    color: theme.colors.textSecondary,
  },
  activeTimeRange: {
    backgroundColor: theme.colors.primary,
    color: '#fff',
    borderColor: theme.colors.primary,
  },
  overviewCard: {
    marginBottom: 16,
  },
  childHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  childInfo: {
    flex: 1,
    marginLeft: 16,
  },
  childName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  childPoints: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  streakContainer: {
    alignItems: 'center',
  },
  streakCount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.warning,
    marginTop: 4,
  },
  streakLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
    paddingVertical: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  progressCard: {
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 12,
  },
  progressItem: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  progressValue: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
  },
  insightsCard: {
    marginBottom: 16,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  insightText: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.text,
    marginLeft: 12,
    lineHeight: 20,
  },
  lastUpdated: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  noAnalyticsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    marginTop: 16,
  },
  noAnalyticsText: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.textSecondary,
    marginTop: 16,
  },
  noAnalyticsSubtext: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
});

export default AnalyticsDashboard;
