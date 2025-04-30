import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppState, Reward, ChildProfile } from '../../types';
import Card from '../common/Card';
import Button from '../common/Button';
import Badge from '../common/Badge';
import { theme } from '../../constants/theme';
import { Feather } from '@expo/vector-icons';
import { fetchRewards } from '../../store/slices/rewardsSlice';
import { redeemReward } from '../../store/slices/rewardsSlice';
import { decrementPoints } from '../../store/slices/childrenSlice';
import { createAppNotification } from '../../services/messaging';
import { formatCurrency } from '../../utils/formatters';

interface RewardStoreProps {
  childId: string;
}

const RewardStore: React.FC<RewardStoreProps> = ({ childId }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: AppState) => state.auth);
  const { rewards, loading } = useSelector((state: AppState) => state.rewards);
  const { children } = useSelector((state: AppState) => state.children);
  
  const [availableRewards, setAvailableRewards] = useState<Reward[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'affordable' | 'cash' | 'other'>('all');
  
  const childProfile: ChildProfile | undefined = children[childId];

  useEffect(() => {
    if (user?.uid) {
      loadRewards();
    }
  }, [dispatch, user?.uid]);

  useEffect(() => {
    filterRewards();
  }, [rewards, selectedCategory, childProfile?.points]);

  const loadRewards = async () => {
    setRefreshing(true);
    await dispatch(fetchRewards(user!.uid));
    setRefreshing(false);
  };

  const filterRewards = () => {
    if (!childProfile) return;
    
    const allRewards = Object.values(rewards).filter(reward => reward.isAvailable);
    let filtered;
    
    switch (selectedCategory) {
      case 'affordable':
        filtered = allRewards.filter(reward => reward.pointCost <= childProfile.points);
        break;
      case 'cash':
        filtered = allRewards.filter(reward => reward.isCashReward);
        break;
      case 'other':
        filtered = allRewards.filter(reward => !reward.isCashReward);
        break;
      default:
        filtered = allRewards;
        break;
    }
    
    // Sort by point cost (lowest first)
    filtered.sort((a, b) => a.pointCost - b.pointCost);
    
    setAvailableRewards(filtered);
  };

  const handleRedeemReward = async (reward: Reward) => {
    if (!childProfile) return;
    
    if (childProfile.points < reward.pointCost) {
      Alert.alert(
        'Not Enough Points',
        `You need ${reward.pointCost - childProfile.points} more points to redeem this reward.`,
        [{ text: 'OK' }]
      );
      return;
    }
    
    try {
      // Confirm redemption
      Alert.alert(
        'Confirm Redemption',
        `Are you sure you want to redeem ${reward.title} for ${reward.pointCost} points?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Confirm',
            onPress: async () => {
              // Create redemption record
              await dispatch(redeemReward({
                rewardId: reward.id,
                childId,
                pointsSpent: reward.pointCost,
                cashValue: reward.cashValue,
              }));
              
              // Deduct points from child's profile
              await dispatch(decrementPoints({
                childId,
                points: reward.pointCost
              }));
              
              // Create notification for parent
              await createAppNotification(
                'Reward Redeemed',
                `${childProfile.name} redeemed ${reward.title} for ${reward.pointCost} points${reward.isCashReward ? ` (${formatCurrency(reward.cashValue! / 100)})` : ''}`,
                'reward',
                { rewardId: reward.id, childId },
                user?.uid
              );
              
              // Show success message
              Alert.alert(
                'Congratulations!',
                `You've successfully redeemed ${reward.title}. A parent will approve this soon.`,
                [{ text: 'OK' }]
              );
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to redeem reward');
    }
  };

  const renderCategoryTab = (name: string, value: 'all' | 'affordable' | 'cash' | 'other') => (
    <TouchableOpacity
      style={[styles.categoryTab, selectedCategory === value && styles.activeCategoryTab]}
      onPress={() => setSelectedCategory(value)}
    >
      <Text style={[styles.categoryText, selectedCategory === value && styles.activeCategoryText]}>
        {name}
      </Text>
    </TouchableOpacity>
  );

  const renderRewardItem = ({ item }: { item: Reward }) => {
    const canAfford = childProfile && childProfile.points >= item.pointCost;
    
    return (
      <Card 
        style={[styles.rewardCard, !canAfford && styles.unaffordableCard]} 
        elevation={canAfford ? 2 : 1}
      >
        <View style={styles.rewardHeader}>
          <Text style={styles.rewardTitle}>{item.title}</Text>
          {item.isCashReward && (
            <Badge 
              label="Cash" 
              type="warning"
              size="small"
              icon={<Feather name="dollar-sign" size={12} color={theme.colors.warning} />}
            />
          )}
        </View>
        
        {item.description ? (
          <Text style={styles.rewardDescription} numberOfLines={2}>
            {item.description}
          </Text>
        ) : null}
        
        <View style={styles.rewardDetails}>
          <View style={styles.pointsContainer}>
            <Feather name="award" size={16} color={canAfford ? theme.colors.primary : theme.colors.textSecondary} />
            <Text style={[styles.pointsText, !canAfford && styles.unaffordableText]}>
              {item.pointCost} points
            </Text>
          </View>
          
          {item.isCashReward && item.cashValue && (
            <View style={styles.cashContainer}>
              <Feather name="dollar-sign" size={16} color={theme.colors.warning} />
              <Text style={styles.cashText}>{formatCurrency(item.cashValue / 100)}</Text>
            </View>
          )}
        </View>
        
        <Button
          title={canAfford ? "Redeem" : `Need ${item.pointCost - (childProfile?.points || 0)} more points`}
          onPress={() => handleRedeemReward(item)}
          type={canAfford ? "primary" : "outline"}
          size="small"
          style={styles.redeemButton}
          disabled={!canAfford}
          icon={canAfford ? <Feather name="shopping-cart" size={16} color="#fff" style={{ marginRight: 8 }} /> : undefined}
        />
      </Card>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading rewards...</Text>
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
    <View style={styles.container}>
      <View style={styles.balanceContainer}>
        <Text style={styles.balanceTitle}>Your Points Balance</Text>
        <Text style={styles.balanceAmount}>{childProfile.points}</Text>
      </View>
      
      <View style={styles.categoriesContainer}>
        {renderCategoryTab('All', 'all')}
        {renderCategoryTab('Affordable', 'affordable')}
        {renderCategoryTab('Cash', 'cash')}
        {renderCategoryTab('Other', 'other')}
      </View>
      
      {availableRewards.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Feather name="shopping-bag" size={50} color={theme.colors.textSecondary} />
          <Text style={styles.emptyText}>
            {selectedCategory === 'all'
              ? 'No rewards available yet'
              : selectedCategory === 'affordable'
              ? `You don't have enough points for any rewards yet`
              : selectedCategory === 'cash'
              ? 'No cash rewards available'
              : 'No non-cash rewards available'}
          </Text>
          {selectedCategory === 'affordable' && (
            <Text style={styles.emptySubtext}>
              Complete more chores to earn points!
            </Text>
          )}
        </View>
      ) : (
        <FlatList
          data={availableRewards}
          renderItem={renderRewardItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          onRefresh={loadRewards}
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  balanceContainer: {
    backgroundColor: theme.colors.primary,
    padding: 20,
    alignItems: 'center',
  },
  balanceTitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
  },
  categoriesContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  categoryTab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeCategoryTab: {
    borderBottomColor: theme.colors.primary,
  },
  categoryText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  activeCategoryText: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
    paddingBottom: 24,
  },
  rewardCard: {
    marginBottom: 12,
  },
  unaffordableCard: {
    opacity: 0.7,
  },
  rewardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  rewardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    flex: 1,
  },
  rewardDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 12,
  },
  rewardDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    alignItems: 'center',
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primaryLight,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  pointsText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
    marginLeft: 6,
  },
  unaffordableText: {
    color: theme.colors.textSecondary,
  },
  cashContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.warningLight,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  cashText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.warning,
    marginLeft: 4,
  },
  redeemButton: {
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

export default RewardStore;
