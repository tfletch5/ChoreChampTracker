import React, { useState } from 'react';
import { StyleSheet, View, SafeAreaView, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import ParentDashboard from './src/screens/parent/ParentDashboard';
import ChildDashboard from './src/screens/child/ChildDashboard';

// Simple demo of the ChoreChamp app - initial prototype version
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
    { id: '1', title: 'Clean bedroom', description: 'Make bed, put away toys, vacuum floor', points: 10, dueDate: 'Today', status: 'pending', assignedTo: '1' },
    { id: '2', title: 'Take out trash', description: 'Take all trash bags to the curb', points: 5, dueDate: 'Today', status: 'completed', assignedTo: '1' },
    { id: '3', title: 'Wash dishes', description: 'Clean all dishes in the sink', points: 15, dueDate: 'Tomorrow', status: 'pending', assignedTo: '2' },
    { id: '4', title: 'Homework', description: 'Complete math and science assignments', points: 20, dueDate: 'Today', status: 'overdue', assignedTo: '2' },
  ];

  // Simulated rewards
  const rewards = [
    { id: '1', title: 'Ice cream', points: 30, description: 'A delicious treat!' },
    { id: '2', title: 'Movie night', points: 50, description: 'Pick any movie to watch' },
    { id: '3', title: 'Video game time (1 hour)', points: 40, description: 'Extra gaming time' },
    { id: '4', title: '$5 Cash', points: 100, description: 'Cash reward', cashValue: 500 },
  ];

  // Navigation actions
  const handleChildPress = (child) => {
    setSelectedChildId(child.id);
    setActiveView('child');
  };

  const handleBackToParent = () => {
    setActiveView('parent');
  };

  // Chore actions
  const handleAddChore = () => {
    alert('Add New Chore - Feature to be implemented');
  };

  const handleCompleteChore = (chore) => {
    alert(`Mark as Complete: ${chore.title}`);
  };

  // Reward actions
  const handleRedeemReward = (reward) => {
    alert(`Redeem ${reward.title} for ${reward.points} points?`);
  };

  // Mock navigation object
  const navigation = {
    navigate: (screenName) => {
      alert(`Navigate to ${screenName} - Feature to be implemented`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.content}>
        {activeView === 'parent' ? (
          <ParentDashboard 
            navigation={navigation}
            childProfiles={childProfiles}
            chores={chores}
            onChildPress={handleChildPress}
            onAddChore={handleAddChore}
          />
        ) : (
          <ChildDashboard 
            navigation={navigation}
            child={childProfiles.find(child => child.id === selectedChildId)}
            chores={chores}
            rewards={rewards}
            onBackPress={handleBackToParent}
            onCompleteChore={handleCompleteChore}
            onRedeemReward={handleRedeemReward}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 25 : 0,
  }
});