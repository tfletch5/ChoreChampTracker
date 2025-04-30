import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Header from '../../components/common/Header';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

const ChildDashboard = ({ navigation, child, chores, rewards, onBackPress, onCompleteChore, onRedeemReward }) => {
  if (!child) {
    return null;
  }
  
  const childChores = chores.filter(chore => chore.assignedTo === child.id);
  
  return (
    <View style={styles.container}>
      <Header 
        title={`${child.name}'s Dashboard`}
        showBackButton
        onBackPress={onBackPress}
      />

      <ScrollView style={styles.scrollView}>
        <Card style={styles.childProfileSummary}>
          <Text style={styles.childAvatarLarge}>{child.avatar}</Text>
          <View style={styles.childInfo}>
            <Text style={styles.childNameLarge}>{child.name}</Text>
            <View style={styles.pointsBadge}>
              <Text style={styles.pointsText}>{child.points} points</Text>
            </View>
          </View>
        </Card>

        <Text style={styles.sectionTitle}>My Chores</Text>
        {childChores.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No chores assigned</Text>
            <Text style={styles.emptyStateSubText}>Check back later for new tasks</Text>
          </View>
        ) : (
          <View style={styles.choresList}>
            {childChores.map(chore => (
              <Card 
                key={chore.id} 
                style={[
                  styles.choreItem, 
                  chore.status === 'completed' ? styles.completedChore : 
                  chore.status === 'overdue' ? styles.overdueChore : null
                ]}
              >
                <View style={styles.choreDetails}>
                  <Text style={styles.choreTitle}>{chore.title}</Text>
                  <Text style={styles.choreInfo}>
                    {chore.points} points • Due: {chore.dueDate}
                  </Text>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>
                      {chore.status.charAt(0).toUpperCase() + chore.status.slice(1)}
                    </Text>
                  </View>
                </View>
                {chore.status === 'pending' && (
                  <TouchableOpacity 
                    style={styles.completeButton}
                    onPress={() => onCompleteChore(chore)}
                  >
                    <Text style={styles.completeText}>Complete</Text>
                  </TouchableOpacity>
                )}
              </Card>
            ))}
          </View>
        )}

        <Text style={styles.sectionTitle}>Rewards Shop</Text>
        {rewards.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No rewards available</Text>
            <Text style={styles.emptyStateSubText}>Complete chores to earn points for rewards</Text>
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.rewardsScroll}>
            {rewards.map(reward => (
              <Card 
                key={reward.id} 
                style={styles.rewardCard}
                onPress={() => onRedeemReward(reward)}
              >
                <Text style={styles.rewardTitle}>{reward.title}</Text>
                <Text style={styles.rewardCost}>{reward.points} points</Text>
                {reward.cashValue && (
                  <Text style={styles.cashValue}>${(reward.cashValue / 100).toFixed(2)}</Text>
                )}
              </Card>
            ))}
          </ScrollView>
        )}

        <View style={styles.buttonGroup}>
          <Button 
            title="My Profile" 
            type="primary"
            style={styles.profileButton}
            onPress={() => navigation.navigate('ChildProfile')}
          />
          <Button 
            title="My Progress" 
            type="primary"
            style={styles.progressButton}
            onPress={() => navigation.navigate('ChildProgress')}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  childProfileSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    marginBottom: 15,
  },
  childAvatarLarge: {
    fontSize: 40,
    marginRight: 15,
  },
  childInfo: {
    flex: 1,
  },
  childNameLarge: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  pointsBadge: {
    backgroundColor: '#e3f2fd',
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignSelf: 'flex-start',
  },
  pointsText: {
    color: '#4285F4',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 10,
    color: '#333',
  },
  choresList: {
    marginBottom: 15,
  },
  choreItem: {
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  completedChore: {
    backgroundColor: '#f0fff0',
    borderLeftWidth: 4,
    borderLeftColor: '#66BB6A',
  },
  overdueChore: {
    backgroundColor: '#fff0f0',
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  choreDetails: {
    flex: 1,
  },
  choreTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5,
  },
  choreInfo: {
    fontSize: 14,
    color: '#888',
    marginBottom: 5,
  },
  statusBadge: {
    backgroundColor: '#f2f2f2',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    color: '#555',
  },
  completeButton: {
    backgroundColor: '#4285F4',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 10,
  },
  completeText: {
    color: 'white',
    fontWeight: 'bold',
  },
  rewardsScroll: {
    marginBottom: 20,
  },
  rewardCard: {
    padding: 15,
    marginRight: 12,
    width: 140,
  },
  rewardTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 10,
  },
  rewardCost: {
    color: '#4285F4',
    fontWeight: '600',
  },
  cashValue: {
    color: '#66BB6A',
    fontWeight: '600',
    marginTop: 5,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    marginBottom: 15,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptyStateSubText: {
    fontSize: 14,
    color: '#888',
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  profileButton: {
    flex: 1,
    marginRight: 6,
    backgroundColor: '#4285F4',
  },
  progressButton: {
    flex: 1,
    marginLeft: 6,
    backgroundColor: '#9C27B0',
  },
});

export default ChildDashboard;