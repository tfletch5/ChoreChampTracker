import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  StatusBar, 
  TouchableOpacity, 
  ScrollView, 
  Image,
  Alert
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { AppState } from '../../types';
import { theme } from '../../constants/theme';
import { Feather } from '@expo/vector-icons';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Avatar from '../../components/common/Avatar';
import ProgressBar from '../../components/common/ProgressBar';
import { formatDate } from '../../utils/formatters';
import { fetchChildAnalytics } from '../../store/slices/analyticsSlice';

const ChildProfile: React.FC<{ navigation: any }> = ({ navigation }) => {
  const dispatch = useDispatch();
  const { selectedChildId } = useSelector((state: AppState) => state.children);
  const { children } = useSelector((state: AppState) => state.children);
  const { childAnalytics } = useSelector((state: AppState) => state.analytics);
  const { chores } = useSelector((state: AppState) => state.chores);
  
  const childProfile = selectedChildId ? children[selectedChildId] : null;
  const analytics = Object.values(childAnalytics).find(a => a.childId === selectedChildId);

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleViewProgress = () => {
    navigation.navigate('ChildProgress');
  };

  const handleViewRewards = () => {
    navigation.navigate('RewardShop');
  };

  const handleViewChores = () => {
    navigation.navigate('ChoreList');
  };

  const getCompletionRate = () => {
    if (analytics) {
      return analytics.completionRate;
    }
    
    // Fallback calculation if analytics not available
    const childChores = Object.values(chores).filter(chore => chore.assignedTo === selectedChildId);
    if (childChores.length === 0) return 0;
    
    const completedChores = childChores.filter(chore => chore.status === 'completed');
    return completedChores.length / childChores.length;
  };

  // Calculate total points earned
  const getTotalPointsEarned = () => {
    const childChores = Object.values(chores).filter(
      chore => chore.assignedTo === selectedChildId && chore.status === 'completed'
    );
    
    return childChores.reduce((sum, chore) => sum + chore.pointValue, 0);
  };

  if (!childProfile) {
    return null;
  }

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
        <Text style={styles.headerTitle}>My Profile</Text>
        <View style={styles.placeholder} />
      </View>
      
      <ScrollView style={styles.content}>
        <View style={styles.profileHeader}>
          <Avatar
            source={childProfile.avatarURL}
            size={100}
            initials={childProfile.name.substring(0, 2)}
            borderColor={theme.colors.primary}
            borderWidth={3}
          />
          <Text style={styles.profileName}>{childProfile.name}</Text>
          <View style={styles.pointsBadge}>
            <Feather name="award" size={16} color={theme.colors.primary} />
            <Text style={styles.pointsText}>{childProfile.points} points</Text>
          </View>
        </View>
        
        <Card style={styles.statsCard}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{analytics?.completedChores || 0}</Text>
              <Text style={styles.statLabel}>Completed Chores</Text>
            </View>
            
            <View style={styles.statDivider} />
            
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{childProfile.streakCount}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
            
            <View style={styles.statDivider} />
            
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{getTotalPointsEarned()}</Text>
              <Text style={styles.statLabel}>Total Points Earned</Text>
            </View>
          </View>
          
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Completion Rate</Text>
              <Text style={styles.progressValue}>{Math.round(getCompletionRate() * 100)}%</Text>
            </View>
            <ProgressBar 
              progress={getCompletionRate()} 
              height={10}
              progressColor={theme.colors.primary}
            />
          </View>
        </Card>
        
        <View style={styles.buttonGroup}>
          <Button 
            title="View Progress" 
            onPress={handleViewProgress} 
            type="outline"
            icon={<Feather name="bar-chart-2" size={18} color={theme.colors.primary} style={{ marginRight: 8 }} />}
            style={styles.actionButton}
          />
          <Button 
            title="View Rewards" 
            onPress={handleViewRewards} 
            type="outline"
            icon={<Feather name="gift" size={18} color={theme.colors.primary} style={{ marginRight: 8 }} />}
            style={styles.actionButton}
          />
        </View>
        
        <Button 
          title="View My Chores" 
          onPress={handleViewChores} 
          type="primary"
          icon={<Feather name="check-square" size={18} color="#fff" style={{ marginRight: 8 }} />}
          style={styles.viewChoresButton}
        />
        
        <Card style={styles.achievementsCard}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          
          <View style={styles.achievementItem}>
            <View style={[
              styles.achievementIcon, 
              childProfile.streakCount >= 3 ? styles.achievementCompleted : styles.achievementIncomplete
            ]}>
              <Feather 
                name="zap" 
                size={20} 
                color={childProfile.streakCount >= 3 ? '#fff' : theme.colors.textSecondary}
              />
            </View>
            <View style={styles.achievementInfo}>
              <Text style={styles.achievementTitle}>3-Day Streak</Text>
              <Text style={styles.achievementDescription}>
                Complete chores for 3 consecutive days
              </Text>
              <ProgressBar 
                progress={Math.min(1, childProfile.streakCount / 3)} 
                height={6}
                progressColor={childProfile.streakCount >= 3 ? theme.colors.success : theme.colors.primary}
              />
            </View>
          </View>
          
          <View style={styles.achievementItem}>
            <View style={[
              styles.achievementIcon, 
              (analytics?.completedChores || 0) >= 10 ? styles.achievementCompleted : styles.achievementIncomplete
            ]}>
              <Feather 
                name="check-circle" 
                size={20} 
                color={(analytics?.completedChores || 0) >= 10 ? '#fff' : theme.colors.textSecondary}
              />
            </View>
            <View style={styles.achievementInfo}>
              <Text style={styles.achievementTitle}>10 Chores Completed</Text>
              <Text style={styles.achievementDescription}>
                Complete a total of 10 chores
              </Text>
              <ProgressBar 
                progress={Math.min(1, (analytics?.completedChores || 0) / 10)} 
                height={6}
                progressColor={(analytics?.completedChores || 0) >= 10 ? theme.colors.success : theme.colors.primary}
              />
            </View>
          </View>
          
          <View style={styles.achievementItem}>
            <View style={[
              styles.achievementIcon, 
              getCompletionRate() >= 0.75 ? styles.achievementCompleted : styles.achievementIncomplete
            ]}>
              <Feather 
                name="award" 
                size={20} 
                color={getCompletionRate() >= 0.75 ? '#fff' : theme.colors.textSecondary}
              />
            </View>
            <View style={styles.achievementInfo}>
              <Text style={styles.achievementTitle}>Completion Champion</Text>
              <Text style={styles.achievementDescription}>
                Achieve a 75% completion rate
              </Text>
              <ProgressBar 
                progress={Math.min(1, getCompletionRate() / 0.75)} 
                height={6}
                progressColor={getCompletionRate() >= 0.75 ? theme.colors.success : theme.colors.primary}
              />
            </View>
          </View>
        </Card>
        
        <Card style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Account Info</Text>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Age</Text>
            <Text style={styles.infoValue}>{childProfile.age} years old</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Account Created</Text>
            <Text style={styles.infoValue}>{formatDate(new Date(childProfile.createdAt))}</Text>
          </View>
        </Card>
      </ScrollView>
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
  content: {
    flex: 1,
    padding: 16,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginTop: 12,
    marginBottom: 8,
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primaryLight,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  pointsText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginLeft: 8,
  },
  statsCard: {
    marginBottom: 20,
    padding: 16,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 20,
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
  progressSection: {
    marginTop: 8,
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
    color: theme.colors.primary,
  },
  buttonGroup: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  viewChoresButton: {
    marginBottom: 20,
  },
  achievementsCard: {
    marginBottom: 20,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 16,
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
  infoCard: {
    marginBottom: 20,
    padding: 16,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
  },
});

export default ChildProfile;
