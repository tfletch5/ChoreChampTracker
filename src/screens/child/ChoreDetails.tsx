import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity, 
  Alert
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppState, Chore } from '../../types';
import { theme } from '../../constants/theme';
import { Feather } from '@expo/vector-icons';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import { useRoute } from '@react-navigation/native';
import { completeChore } from '../../store/slices/choresSlice';
import { incrementPoints, updateStreak } from '../../store/slices/childrenSlice';
import { formatDate, formatTime } from '../../utils/formatters';
import { createAppNotification } from '../../services/messaging';

const ChoreDetails: React.FC<{ navigation: any }> = ({ navigation }) => {
  const dispatch = useDispatch();
  const route = useRoute();
  const { chore } = route.params as { chore: Chore };
  
  const { user } = useSelector((state: AppState) => state.auth);
  const { children } = useSelector((state: AppState) => state.children);
  const { selectedChildId } = useSelector((state: AppState) => state.children);
  
  const [completing, setCompleting] = useState(false);

  const childProfile = selectedChildId ? children[selectedChildId] : null;

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleCompleteChore = async () => {
    if (!user || !childProfile || !selectedChildId) return;
    
    setCompleting(true);
    try {
      // Update chore status
      await dispatch(completeChore({
        id: chore.id,
        completedAt: Date.now()
      }));
      
      // Add points to child's profile
      await dispatch(incrementPoints({
        childId: selectedChildId,
        points: chore.pointValue
      }));
      
      // Update streak
      await dispatch(updateStreak({ childId: selectedChildId }));
      
      // Create notification
      await createAppNotification(
        'Chore Completed',
        `${childProfile.name} completed ${chore.title} and earned ${chore.pointValue} points!`,
        'chore',
        { choreId: chore.id, childId: selectedChildId },
        user.uid
      );
      
      Alert.alert(
        'Great Job!',
        `You earned ${chore.pointValue} points for completing this chore.`,
        [{ 
          text: 'OK',
          onPress: () => navigation.goBack()
        }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to complete chore');
      setCompleting(false);
    }
  };

  const handleSnoozeChore = () => {
    Alert.alert(
      'Snooze Reminder',
      'This feature will be available in a future update.',
      [{ text: 'OK' }]
    );
  };

  // Get status color
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

  // Get recurring pattern text
  const getRecurringText = () => {
    if (!chore.isRecurring || !chore.recurringPattern) return 'One-time chore';
    
    const { frequency, interval } = chore.recurringPattern;
    
    switch (frequency) {
      case 'daily':
        return `Repeats every ${interval > 1 ? `${interval} days` : 'day'}`;
      case 'weekly':
        return `Repeats every ${interval > 1 ? `${interval} weeks` : 'week'}`;
      case 'monthly':
        return `Repeats every ${interval > 1 ? `${interval} months` : 'month'}`;
      default:
        return 'Recurring chore';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chore Details</Text>
        <View style={styles.placeholder} />
      </View>
      
      <ScrollView style={styles.content}>
        <Card style={styles.choreCard}>
          <View style={styles.choreHeader}>
            <Text style={styles.choreTitle}>{chore.title}</Text>
            <Badge 
              label={chore.status.charAt(0).toUpperCase() + chore.status.slice(1)} 
              type={
                chore.status === 'completed' ? 'success' : 
                chore.status === 'overdue' ? 'error' : 'primary'
              }
              size="medium"
            />
          </View>
          
          <View style={styles.pointsContainer}>
            <Feather name="award" size={24} color={theme.colors.primary} />
            <Text style={styles.pointsValue}>{chore.pointValue} points</Text>
          </View>
          
          {chore.description ? (
            <View style={styles.descriptionContainer}>
              <Text style={styles.descriptionLabel}>Description:</Text>
              <Text style={styles.descriptionText}>{chore.description}</Text>
            </View>
          ) : null}
          
          <View style={styles.detailsContainer}>
            <View style={styles.detailItem}>
              <Feather name="calendar" size={20} color={theme.colors.textSecondary} />
              <View style={styles.detailTextContainer}>
                <Text style={styles.detailLabel}>Due Date:</Text>
                <Text style={styles.detailText}>
                  {formatDate(new Date(chore.dueDate))}
                </Text>
              </View>
            </View>
            
            <View style={styles.detailItem}>
              <Feather name="clock" size={20} color={theme.colors.textSecondary} />
              <View style={styles.detailTextContainer}>
                <Text style={styles.detailLabel}>Due Time:</Text>
                <Text style={styles.detailText}>
                  {formatTime(new Date(chore.dueDate))}
                </Text>
              </View>
            </View>
            
            <View style={styles.detailItem}>
              <Feather name="repeat" size={20} color={theme.colors.textSecondary} />
              <View style={styles.detailTextContainer}>
                <Text style={styles.detailLabel}>Frequency:</Text>
                <Text style={styles.detailText}>{getRecurringText()}</Text>
              </View>
            </View>
            
            {chore.completedAt && (
              <View style={styles.detailItem}>
                <Feather name="check-circle" size={20} color={theme.colors.success} />
                <View style={styles.detailTextContainer}>
                  <Text style={styles.detailLabel}>Completed:</Text>
                  <Text style={styles.detailText}>
                    {formatDate(new Date(chore.completedAt))} at {formatTime(new Date(chore.completedAt))}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </Card>
        
        {chore.status === 'pending' && (
          <View style={styles.actionsContainer}>
            <Button
              title="Complete Chore"
              onPress={handleCompleteChore}
              loading={completing}
              type="primary"
              icon={<Feather name="check-circle" size={20} color="#fff" style={{ marginRight: 8 }} />}
              style={styles.actionButton}
            />
            <Button
              title="Snooze Reminder"
              onPress={handleSnoozeChore}
              type="outline"
              icon={<Feather name="clock" size={20} color={theme.colors.primary} style={{ marginRight: 8 }} />}
              style={styles.actionButton}
            />
          </View>
        )}
        
        {chore.status === 'completed' && (
          <View style={styles.completedContainer}>
            <View style={styles.completedIconContainer}>
              <Feather name="check-circle" size={60} color={theme.colors.success} />
            </View>
            <Text style={styles.completedText}>
              Great job! You've completed this chore and earned {chore.pointValue} points.
            </Text>
          </View>
        )}
        
        {chore.status === 'overdue' && (
          <View style={styles.actionsContainer}>
            <Button
              title="Complete Anyway"
              onPress={handleCompleteChore}
              loading={completing}
              type="primary"
              icon={<Feather name="check-circle" size={20} color="#fff" style={{ marginRight: 8 }} />}
              style={styles.actionButton}
            />
            <Text style={styles.overdueText}>
              This chore is past due, but you can still complete it to earn points.
            </Text>
          </View>
        )}
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
  choreCard: {
    marginBottom: 16,
    padding: 16,
  },
  choreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  choreTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    flex: 1,
    marginRight: 8,
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primaryLight,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  pointsValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginLeft: 8,
  },
  descriptionContainer: {
    marginBottom: 16,
  },
  descriptionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  descriptionText: {
    fontSize: 16,
    color: theme.colors.text,
    lineHeight: 24,
  },
  detailsContainer: {
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: 8,
    padding: 16,
  },
  detailItem: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  detailTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  detailText: {
    fontSize: 16,
    color: theme.colors.text,
  },
  actionsContainer: {
    marginVertical: 16,
  },
  actionButton: {
    marginBottom: 12,
  },
  completedContainer: {
    alignItems: 'center',
    marginVertical: 24,
    padding: 16,
    backgroundColor: theme.colors.successLight,
    borderRadius: 8,
  },
  completedIconContainer: {
    marginBottom: 16,
  },
  completedText: {
    fontSize: 16,
    color: theme.colors.success,
    textAlign: 'center',
    lineHeight: 24,
  },
  overdueText: {
    fontSize: 14,
    color: theme.colors.error,
    textAlign: 'center',
    marginTop: 8,
  },
});

export default ChoreDetails;
