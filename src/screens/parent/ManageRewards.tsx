import React, { useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  StatusBar, 
  TouchableOpacity, 
  FlatList,
  Alert
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppState, Reward } from '../../types';
import { theme } from '../../constants/theme';
import RewardForm from '../../components/parent/RewardForm';
import { Feather } from '@expo/vector-icons';
import { fetchRewards, deleteReward } from '../../store/slices/rewardsSlice';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { useRoute } from '@react-navigation/native';
import { formatCurrency } from '../../utils/formatters';

interface RouteParams {
  mode?: 'add' | 'edit';
  rewardId?: string;
}

const ManageRewards: React.FC<{ navigation: any }> = ({ navigation }) => {
  const dispatch = useDispatch();
  const route = useRoute();
  const params = route.params as RouteParams || {};
  const { mode = 'list', rewardId } = params;
  
  const { user } = useSelector((state: AppState) => state.auth);
  const { rewards, loading } = useSelector((state: AppState) => state.rewards);
  
  const rewardsList = Object.values(rewards);
  const selectedReward = rewardId ? rewards[rewardId] : undefined;

  useEffect(() => {
    if (user?.uid) {
      dispatch(fetchRewards(user.uid));
    }
  }, [dispatch, user?.uid]);

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleSuccess = () => {
    navigation.goBack();
  };

  const handleAddReward = () => {
    navigation.navigate('ManageRewards', { mode: 'add' });
  };

  const handleEditReward = (reward: Reward) => {
    navigation.navigate('ManageRewards', { mode: 'edit', rewardId: reward.id });
  };

  const handleDeleteReward = (reward: Reward) => {
    Alert.alert(
      'Delete Reward',
      `Are you sure you want to delete "${reward.title}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await dispatch(deleteReward(reward.id));
          },
        },
      ]
    );
  };

  const renderRewardItem = ({ item }: { item: Reward }) => (
    <Card key={item.id} style={styles.rewardCard}>
      <View style={styles.rewardHeader}>
        <Text style={styles.rewardTitle}>{item.title}</Text>
        <View style={styles.badges}>
          {item.isCashReward && (
            <Badge 
              label="Cash" 
              type="warning"
              size="small"
              icon={<Feather name="dollar-sign" size={12} color={theme.colors.warning} />}
              style={styles.badge}
            />
          )}
          <Badge 
            label={item.isAvailable ? 'Available' : 'Hidden'} 
            type={item.isAvailable ? 'success' : 'error'}
            size="small"
            style={styles.badge}
          />
        </View>
      </View>
      
      {item.description ? (
        <Text style={styles.rewardDescription} numberOfLines={2}>
          {item.description}
        </Text>
      ) : null}
      
      <View style={styles.rewardDetails}>
        <View style={styles.rewardDetail}>
          <Feather name="award" size={16} color={theme.colors.textSecondary} />
          <Text style={styles.rewardDetailText}>{item.pointCost} points</Text>
        </View>
        
        {item.isCashReward && item.cashValue && (
          <View style={styles.rewardDetail}>
            <Feather name="dollar-sign" size={16} color={theme.colors.textSecondary} />
            <Text style={styles.rewardDetailText}>{formatCurrency(item.cashValue / 100)}</Text>
          </View>
        )}
      </View>
      
      <View style={styles.rewardActions}>
        <Button
          title="Edit"
          onPress={() => handleEditReward(item)}
          type="outline"
          size="small"
          style={styles.actionButton}
          icon={<Feather name="edit" size={16} color={theme.colors.primary} style={{ marginRight: 8 }} />}
        />
        <Button
          title="Delete"
          onPress={() => handleDeleteReward(item)}
          type="outline"
          size="small"
          style={[styles.actionButton, styles.deleteButton]}
          icon={<Feather name="trash-2" size={16} color={theme.colors.error} style={{ marginRight: 8 }} />}
          textStyle={{ color: theme.colors.error }}
        />
      </View>
    </Card>
  );

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
        <Text style={styles.headerTitle}>
          {mode === 'add' ? 'Add Reward' : mode === 'edit' ? 'Edit Reward' : 'Manage Rewards'}
        </Text>
        {mode === 'list' && (
          <TouchableOpacity onPress={handleAddReward} style={styles.addButton}>
            <Feather name="plus" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
        )}
        {(mode === 'add' || mode === 'edit') && <View style={styles.placeholder} />}
      </View>

      {mode === 'add' && (
        <RewardForm onSuccess={handleSuccess} />
      )}

      {mode === 'edit' && selectedReward && (
        <RewardForm existingReward={selectedReward} onSuccess={handleSuccess} />
      )}

      {mode === 'list' && (
        <FlatList
          data={rewardsList}
          renderItem={renderRewardItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Feather name="gift" size={50} color={theme.colors.textSecondary} />
              <Text style={styles.emptyText}>No rewards added yet</Text>
              <Button 
                title="Add Reward" 
                onPress={handleAddReward} 
                type="primary"
                icon={<Feather name="plus" size={16} color="#fff" style={{ marginRight: 8 }} />}
              />
            </View>
          )}
        />
      )}
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
  addButton: {
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
  listContent: {
    padding: 16,
    paddingBottom: 24,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginVertical: 16,
  },
  rewardCard: {
    marginBottom: 12,
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
  badges: {
    flexDirection: 'row',
  },
  badge: {
    marginLeft: 4,
  },
  rewardDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 12,
  },
  rewardDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  rewardDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  rewardDetailText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginLeft: 6,
  },
  rewardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    marginLeft: 8,
  },
  deleteButton: {
    borderColor: theme.colors.error,
  },
});

export default ManageRewards;
