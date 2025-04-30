import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppState, ChildProfile, ChildAnalytics, Chore } from '../../types';
import Card from '../common/Card';
import ProgressBar from '../common/ProgressBar';
import { theme } from '../../constants/theme';
import { Feather } from '@expo/vector-icons';
import { fetchChildAnalytics } from '../../store/slices/analyticsSlice';
import { fetchChoresByChildId } from '../../store/slices/choresSlice';

interface ProgressTrackerProps {
  childId: string;
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({ childId }) => {
  const dispatch = useDispatch();
  const { childAnalytics, loading: analyticsLoading } = useSelector((state: AppState) => state.analytics);
  const { children } = useSelector((state: AppState) => state.children);
  const { chores } = useSelector((state: AppState) => state.chores);
  
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'allTime'>('week');
  const [choresByDay, setChoresByDay] = useState<Record<string, number>>({});
  const [pointsByDay, setPointsByDay] = useState<Record<string, number>>({});
  
  const childProfile = children[childId];
  const analytics = Object.values(childAnalytics).find(a => a.childId === childId);

  useEffect(() => {
    if (childId) {
      dispatch(fetchChildAnalytics({ childId, timeRange }));
      dispatch(fetchChoresByChildId(childId));
    }
  }, [dispatch, childId, timeRange]);

  useEffect(() => {
    if (Object.keys(chores).length > 0) {
      generateChartData();
    }
  }, [chores, timeRange]);

  const generateChartData = () => {
    const childChores = Object.values(chores).filter(chore => 
      chore.assignedTo === childId && 
      chore.status === 'completed' && 
      chore.completedAt
    );
    
    // For choresByDay and pointsByDay
    const days: Record<string, number> = {};
    const points: Record<string, number> = {};
    
    // Determine date range based on timeRange
    const endDate = new Date();
    const startDate = new Date();
    
    if (timeRange === 'week') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (timeRange === 'month') {
      startDate.setMonth(startDate.getMonth() - 1);
    } else {
      startDate.setMonth(startDate.getMonth() - 3); // For allTime, show last 3 months
    }
    
    // Initialize all days in the range
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateString = currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      days[dateString] = 0;
      points[dateString] = 0;
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Fill in completed chores and points
    childChores.forEach(chore => {
      if (chore.completedAt) {
        const completedDate = new Date(chore.completedAt);
        if (completedDate >= startDate && completedDate <= endDate) {
          const dateString = completedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          
          // Increment chore count
          days[dateString] = (days[dateString] || 0) + 1;
          
          // Add points
          points[dateString] = (points[dateString] || 0) + chore.pointValue;
        }
      }
    });
    
    setChoresByDay(days);
    setPointsByDay(points);
  };

  const handleTimeRangeChange = (range: 'week' | 'month' | 'allTime') => {
    setTimeRange(range);
  };

  const calculateTotalPointsEarned = () => {
    return Object.values(pointsByDay).reduce((sum, points) => sum + points, 0);
  };

  const calculateCompletionRate = () => {
    if (!analytics) return 0;
    return analytics.completionRate;
  };

  const calculateAveragePointsPerDay = () => {
    const totalPoints = calculateTotalPointsEarned();
    const dayCount = Object.keys(pointsByDay).length;
    return dayCount > 0 ? Math.round(totalPoints / dayCount) : 0;
  };

  if (analyticsLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading progress data...</Text>
      </View>
    );
  }

  if (!childProfile) {
    return (
      <View style={styles.errorContainer}>
        <Text>Child profile not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.timeRangeSelector}>
        <Text 
          style={[styles.timeRangeOption, timeRange === 'week' && styles.activeTimeRange]}
          onPress={() => handleTimeRangeChange('week')}
        >
          Week
        </Text>
        <Text 
          style={[styles.timeRangeOption, timeRange === 'month' && styles.activeTimeRange]}
          onPress={() => handleTimeRangeChange('month')}
        >
          Month
        </Text>
        <Text 
          style={[styles.timeRangeOption, timeRange === 'allTime' && styles.activeTimeRange]}
          onPress={() => handleTimeRangeChange('allTime')}
        >
          All Time
        </Text>
      </View>
      
      <Card style={styles.summaryCard}>
        <Text style={styles.cardTitle}>Your Progress Summary</Text>
        
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{calculateTotalPointsEarned()}</Text>
            <Text style={styles.statLabel}>Points Earned</Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {analytics ? analytics.completedChores : 0}
            </Text>
            <Text style={styles.statLabel}>Chores Completed</Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {analytics ? analytics.currentStreak : 0}
            </Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
        </View>
      </Card>
      
      <Card style={styles.progressCard}>
        <Text style={styles.cardTitle}>Completion Progress</Text>
        
        <View style={styles.progressItem}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Overall Completion</Text>
            <Text style={styles.progressValue}>{Math.round(calculateCompletionRate() * 100)}%</Text>
          </View>
          <ProgressBar 
            progress={calculateCompletionRate()} 
            height={12}
            progressColor={theme.colors.primary}
          />
        </View>
        
        <View style={styles.progressItem}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Daily Points Average</Text>
            <Text style={styles.progressValue}>
              {calculateAveragePointsPerDay()} points/day
            </Text>
          </View>
          <ProgressBar 
            progress={Math.min(1, calculateAveragePointsPerDay() / 30)} 
            height={12}
            progressColor={theme.colors.secondary}
          />
        </View>
        
        <View style={styles.progressItem}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Streak Progress</Text>
            <Text style={styles.progressValue}>
              {analytics?.currentStreak || 0} / {analytics?.longestStreak || 0}
            </Text>
          </View>
          <ProgressBar 
            progress={analytics && analytics.longestStreak > 0 ? 
              (analytics.currentStreak / analytics.longestStreak) : 0
            } 
            height={12}
            progressColor={theme.colors.warning}
          />
        </View>
      </Card>
      
      <Card style={styles.chartCard}>
        <Text style={styles.cardTitle}>Chores Completed</Text>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chartScrollView}>
          <View style={styles.chartContainer}>
            {Object.keys(choresByDay).length > 0 ? (
              <View style={styles.barChartContainer}>
                {Object.entries(choresByDay).map(([date, count], index) => (
                  <View key={date} style={styles.barChartColumn}>
                    <View style={styles.barChartLabels}>
                      <Text style={styles.barChartCount}>{count}</Text>
                      <View 
                        style={[
                          styles.barChartBar, 
                          { height: Math.max(5, count * 20) }
                        ]} 
                      />
                      <Text style={styles.barChartDate}>
                        {date.split(' ')[1]}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.noDataContainer}>
                <Feather name="bar-chart-2" size={40} color={theme.colors.textSecondary} />
                <Text style={styles.noDataText}>No data for this period</Text>
              </View>
            )}
          </View>
        </ScrollView>
      </Card>
      
      <Card style={styles.chartCard}>
        <Text style={styles.cardTitle}>Points Earned</Text>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chartScrollView}>
          <View style={styles.chartContainer}>
            {Object.keys(pointsByDay).length > 0 ? (
              <View style={styles.barChartContainer}>
                {Object.entries(pointsByDay).map(([date, points], index) => (
                  <View key={date} style={styles.barChartColumn}>
                    <View style={styles.barChartLabels}>
                      <Text style={styles.barChartCount}>{points}</Text>
                      <View 
                        style={[
                          styles.barChartBar, 
                          styles.pointsBar,
                          { height: Math.max(5, points * 2) }
                        ]} 
                      />
                      <Text style={styles.barChartDate}>
                        {date.split(' ')[1]}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.noDataContainer}>
                <Feather name="bar-chart-2" size={40} color={theme.colors.textSecondary} />
                <Text style={styles.noDataText}>No data for this period</Text>
              </View>
            )}
          </View>
        </ScrollView>
      </Card>
      
      <Card style={styles.achievementsCard}>
        <Text style={styles.cardTitle}>Achievements</Text>
        
        {analytics ? (
          <View>
            <View style={styles.achievementItem}>
              <View style={[
                styles.achievementIcon, 
                analytics.currentStreak >= 3 ? styles.achievementCompleted : styles.achievementIncomplete
              ]}>
                <Feather 
                  name="zap" 
                  size={20} 
                  color={analytics.currentStreak >= 3 ? '#fff' : theme.colors.textSecondary}
                />
              </View>
              <View style={styles.achievementInfo}>
                <Text style={styles.achievementTitle}>3-Day Streak</Text>
                <Text style={styles.achievementDescription}>
                  Complete chores for 3 consecutive days
                </Text>
                <ProgressBar 
                  progress={Math.min(1, analytics.currentStreak / 3)} 
                  height={6}
                  progressColor={analytics.currentStreak >= 3 ? theme.colors.success : theme.colors.primary}
                />
              </View>
            </View>
            
            <View style={styles.achievementItem}>
              <View style={[
                styles.achievementIcon, 
                analytics.completedChores >= 10 ? styles.achievementCompleted : styles.achievementIncomplete
              ]}>
                <Feather 
                  name="check-circle" 
                  size={20} 
                  color={analytics.completedChores >= 10 ? '#fff' : theme.colors.textSecondary}
                />
              </View>
              <View style={styles.achievementInfo}>
                <Text style={styles.achievementTitle}>10 Chores Completed</Text>
                <Text style={styles.achievementDescription}>
                  Complete a total of 10 chores
                </Text>
                <ProgressBar 
                  progress={Math.min(1, analytics.completedChores / 10)} 
                  height={6}
                  progressColor={analytics.completedChores >= 10 ? theme.colors.success : theme.colors.primary}
                />
              </View>
            </View>
            
            <View style={styles.achievementItem}>
              <View style={[
                styles.achievementIcon, 
                analytics.completionRate >= 0.75 ? styles.achievementCompleted : styles.achievementIncomplete
              ]}>
                <Feather 
                  name="award" 
                  size={20} 
                  color={analytics.completionRate >= 0.75 ? '#fff' : theme.colors.textSecondary}
                />
              </View>
              <View style={styles.achievementInfo}>
                <Text style={styles.achievementTitle}>Completion Champion</Text>
                <Text style={styles.achievementDescription}>
                  Achieve a 75% completion rate
                </Text>
                <ProgressBar 
                  progress={Math.min(1, analytics.completionRate / 0.75)} 
                  height={6}
                  progressColor={analytics.completionRate >= 0.75 ? theme.colors.success : theme.colors.primary}
                />
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.noDataContainer}>
            <Feather name="award" size={40} color={theme.colors.textSecondary} />
            <Text style={styles.noDataText}>Complete chores to earn achievements</Text>
          </View>
        )}
      </Card>
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
    paddingBottom: 24,
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  timeRangeSelector: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
    ...theme.shadows.small,
  },
  timeRangeOption: {
    flex: 1,
    paddingVertical: 12,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.textSecondary,
  },
  activeTimeRange: {
    backgroundColor: theme.colors.primary,
    color: '#fff',
  },
  summaryCard: {
    marginBottom: 16,
    padding: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: theme.colors.border,
  },
  progressCard: {
    marginBottom: 16,
    padding: 16,
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
  chartCard: {
    marginBottom: 16,
    padding: 16,
  },
  chartScrollView: {
    marginHorizontal: -16,
  },
  chartContainer: {
    paddingHorizontal: 16,
    minWidth: '100%',
  },
  barChartContainer: {
    flexDirection: 'row',
    height: 120,
    alignItems: 'flex-end',
    paddingTop: 20,
  },
  barChartColumn: {
    marginRight: 8,
    width: 40,
    alignItems: 'center',
  },
  barChartLabels: {
    alignItems: 'center',
  },
  barChartCount: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.primary,
    marginBottom: 4,
  },
  barChartBar: {
    width: 12,
    backgroundColor: theme.colors.primary,
    borderRadius: 6,
    minHeight: 5,
  },
  pointsBar: {
    backgroundColor: theme.colors.secondary,
  },
  barChartDate: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  noDataContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    height: 100,
  },
  noDataText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 8,
  },
  achievementsCard: {
    marginBottom: 16,
    padding: 16,
  },
  achievementItem: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  achievementIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  achievementCompleted: {
    backgroundColor: theme.colors.success,
  },
  achievementIncomplete: {
    backgroundColor: theme.colors.backgroundSecondary,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 2,
  },
  achievementDescription: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 8,
  },
});

export default ProgressTracker;
