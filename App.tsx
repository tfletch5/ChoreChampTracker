import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';

// Simple demo of the ChoreChamp app
export default function App() {
  const [activeView, setActiveView] = useState('parent'); // Can be 'parent' or 'child'
  const [selectedChildId, setSelectedChildId] = useState(null);

  // Simulated child profiles
  const childProfiles = [
    { id: '1', name: 'Alex', age: 9, points: 150, avatar: '👦' },
    { id: '2', name: 'Sophia', age: 7, points: 120, avatar: '👧' },
  ];

  // Simulated chores
  const chores = [
    { id: '1', title: 'Clean bedroom', points: 10, dueDate: 'Today', status: 'pending', assignedTo: '1' },
    { id: '2', title: 'Take out trash', points: 5, dueDate: 'Today', status: 'completed', assignedTo: '1' },
    { id: '3', title: 'Wash dishes', points: 15, dueDate: 'Tomorrow', status: 'pending', assignedTo: '2' },
    { id: '4', title: 'Homework', points: 20, dueDate: 'Today', status: 'overdue', assignedTo: '2' },
  ];

  // Simulated rewards
  const rewards = [
    { id: '1', title: 'Ice cream', points: 30, description: 'A delicious treat!' },
    { id: '2', title: 'Movie night', points: 50, description: 'Pick any movie to watch' },
    { id: '3', title: 'Video game time (1 hour)', points: 40, description: 'Extra gaming time' },
    { id: '4', title: '$5 Cash', points: 100, description: 'Cash reward', cashValue: 500 },
  ];

  const renderParentDashboard = () => (
    <View style={styles.dashboard}>
      <View style={styles.parentHeader}>
        <Text style={styles.headerTitle}>Parent Dashboard</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => alert("Add New Chore")}
        >
          <Text style={styles.buttonText}>+ Add Chore</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Children</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.childrenScroll}>
        {childProfiles.map(child => (
          <TouchableOpacity 
            key={child.id} 
            style={styles.childCard}
            onPress={() => {
              setSelectedChildId(child.id);
              setActiveView('child');
            }}
          >
            <Text style={styles.childAvatar}>{child.avatar}</Text>
            <Text style={styles.childName}>{child.name}</Text>
            <Text style={styles.childPoints}>{child.points} points</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={[styles.childCard, styles.addChildCard]}>
          <Text style={styles.addChildText}>+</Text>
          <Text style={styles.addChildLabel}>Add Child</Text>
        </TouchableOpacity>
      </ScrollView>

      <Text style={styles.sectionTitle}>Pending Chores</Text>
      <ScrollView style={styles.choresList}>
        {chores.filter(chore => chore.status === 'pending').map(chore => {
          const assignedChild = childProfiles.find(child => child.id === chore.assignedTo);
          return (
            <View key={chore.id} style={styles.choreItem}>
              <View style={styles.choreDetails}>
                <Text style={styles.choreTitle}>{chore.title}</Text>
                <Text style={styles.choreAssigned}>Assigned to: {assignedChild?.name || 'Unknown'}</Text>
                <Text style={styles.choreInfo}>
                  {chore.points} points • Due: {chore.dueDate}
                </Text>
              </View>
              <TouchableOpacity 
                style={styles.verifyButton}
                onPress={() => alert(`Verify completion of: ${chore.title}`)}
              >
                <Text style={styles.verifyText}>Verify</Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.buttonGroup}>
        <TouchableOpacity 
          style={[styles.navButton, styles.calendarButton]}
          onPress={() => alert("View Calendar")}
        >
          <Text style={styles.navButtonText}>Calendar</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.navButton, styles.rewardsButton]}
          onPress={() => alert("Manage Rewards")}
        >
          <Text style={styles.navButtonText}>Rewards</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.navButton, styles.walletButton]}
          onPress={() => alert("Family Wallet")}
        >
          <Text style={styles.navButtonText}>Wallet</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderChildDashboard = () => {
    const child = childProfiles.find(child => child.id === selectedChildId);
    
    if (!child) {
      return null;
    }
    
    const childChores = chores.filter(chore => chore.assignedTo === child.id);
    
    return (
      <View style={styles.dashboard}>
        <View style={styles.childHeader}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => setActiveView('parent')}
          >
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{child.name}'s Dashboard</Text>
        </View>

        <View style={styles.childProfileSummary}>
          <Text style={styles.childAvatarLarge}>{child.avatar}</Text>
          <View style={styles.childInfo}>
            <Text style={styles.childNameLarge}>{child.name}</Text>
            <View style={styles.pointsBadge}>
              <Text style={styles.pointsText}>{child.points} points</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>My Chores</Text>
        <ScrollView style={styles.choresList}>
          {childChores.map(chore => (
            <View key={chore.id} style={[styles.choreItem, 
              chore.status === 'completed' ? styles.completedChore : 
              chore.status === 'overdue' ? styles.overdueChore : null
            ]}>
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
                  onPress={() => alert(`Mark as Complete: ${chore.title}`)}
                >
                  <Text style={styles.completeText}>Complete</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </ScrollView>

        <Text style={styles.sectionTitle}>Rewards Shop</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.rewardsScroll}>
          {rewards.map(reward => (
            <TouchableOpacity 
              key={reward.id} 
              style={styles.rewardCard}
              onPress={() => alert(`Redeem ${reward.title} for ${reward.points} points?`)}
            >
              <Text style={styles.rewardTitle}>{reward.title}</Text>
              <Text style={styles.rewardCost}>{reward.points} points</Text>
              {reward.cashValue && (
                <Text style={styles.cashValue}>${(reward.cashValue / 100).toFixed(2)}</Text>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.buttonGroup}>
          <TouchableOpacity 
            style={[styles.navButton, styles.profileButton]}
            onPress={() => alert("View Profile")}
          >
            <Text style={styles.navButtonText}>My Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.navButton, styles.progressButton]}
            onPress={() => alert("View Progress")}
          >
            <Text style={styles.navButtonText}>My Progress</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      {activeView === 'parent' ? renderParentDashboard() : renderChildDashboard()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  dashboard: {
    flex: 1,
    padding: 16,
    paddingTop: 50,
  },
  parentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  childHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  backButton: {
    marginRight: 10,
  },
  backText: {
    fontSize: 18,
    color: '#4285F4',
  },
  addButton: {
    backgroundColor: '#4285F4',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#333',
  },
  childrenScroll: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  childCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginRight: 12,
    alignItems: 'center',
    width: 110,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  childAvatar: {
    fontSize: 30,
    marginBottom: 10,
  },
  childName: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  childPoints: {
    color: '#4285F4',
    fontWeight: '500',
  },
  addChildCard: {
    backgroundColor: '#f0f0f0',
  },
  addChildText: {
    fontSize: 30,
    color: '#aaa',
    marginBottom: 10,
  },
  addChildLabel: {
    color: '#aaa',
  },
  choresList: {
    marginBottom: 10,
  },
  choreItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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
  choreAssigned: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
  },
  choreInfo: {
    fontSize: 14,
    color: '#888',
  },
  statusBadge: {
    backgroundColor: '#f2f2f2',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: 'flex-start',
    marginTop: 5,
  },
  statusText: {
    fontSize: 12,
    color: '#555',
  },
  verifyButton: {
    backgroundColor: '#66BB6A',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 10,
  },
  verifyText: {
    color: 'white',
    fontWeight: 'bold',
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
  childProfileSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginTop: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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
  rewardsScroll: {
    marginBottom: 20,
  },
  rewardCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginRight: 12,
    width: 140,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  navButton: {
    flex: 1,
    backgroundColor: '#4285F4',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  navButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  calendarButton: {
    backgroundColor: '#FF9800',
  },
  rewardsButton: {
    backgroundColor: '#9C27B0',
  },
  walletButton: {
    backgroundColor: '#66BB6A',
  },
  profileButton: {
    backgroundColor: '#4285F4',
  },
  progressButton: {
    backgroundColor: '#9C27B0',
  },
});
