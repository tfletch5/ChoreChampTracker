import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Header from '../../components/common/Header';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

const ParentDashboard = ({ navigation, childProfiles, chores, onChildPress, onAddChore }) => {
  const pendingChores = chores.filter(chore => chore.status === 'pending');

  return (
    <View style={styles.container}>
      <Header 
        title="Parent Dashboard" 
        rightComponent={
          <Button 
            title="+ Add Chore" 
            type="primary"
            size="small"
            onPress={onAddChore}
          />
        }
      />

      <ScrollView style={styles.scrollView}>
        <Text style={styles.sectionTitle}>Children</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.childrenScroll}>
          {childProfiles.map(child => (
            <Card 
              key={child.id} 
              style={styles.childCard}
              onPress={() => onChildPress(child)}
            >
              <Text style={styles.childAvatar}>{child.avatar}</Text>
              <Text style={styles.childName}>{child.name}</Text>
              <Text style={styles.childPoints}>{child.points} points</Text>
            </Card>
          ))}
          <Card 
            style={[styles.childCard, styles.addChildCard]}
            onPress={() => navigation.navigate('AddChild')}
          >
            <Text style={styles.addChildText}>+</Text>
            <Text style={styles.addChildLabel}>Add Child</Text>
          </Card>
        </ScrollView>

        <Text style={styles.sectionTitle}>Pending Chores</Text>
        {pendingChores.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No pending chores</Text>
            <Text style={styles.emptyStateSubText}>Add some chores to get started</Text>
            <Button
              title="+ Add Chore"
              onPress={onAddChore}
              style={styles.emptyStateButton}
            />
          </View>
        ) : (
          <View style={styles.choresList}>
            {pendingChores.map(chore => {
              const assignedChild = childProfiles.find(child => child.id === chore.assignedTo);
              return (
                <Card key={chore.id} style={styles.choreItem}>
                  <View style={styles.choreDetails}>
                    <Text style={styles.choreTitle}>{chore.title}</Text>
                    <Text style={styles.choreAssigned}>
                      Assigned to: {assignedChild ? assignedChild.name : 'Unknown'}
                    </Text>
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
                </Card>
              );
            })}
          </View>
        )}

        <View style={styles.buttonGroup}>
          <Button 
            title="Calendar" 
            type="primary"
            style={styles.calendarButton}
            onPress={() => navigation.navigate('Calendar')}
          />
          <Button 
            title="Rewards" 
            type="primary"
            style={styles.rewardsButton}
            onPress={() => navigation.navigate('Rewards')}
          />
          <Button 
            title="Wallet" 
            type="primary"
            style={styles.walletButton}
            onPress={() => navigation.navigate('Wallet')}
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 10,
    color: '#333',
  },
  childrenScroll: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  childCard: {
    padding: 15,
    marginRight: 12,
    alignItems: 'center',
    width: 110,
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
    marginBottom: 20,
  },
  choreItem: {
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    marginBottom: 20,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptyStateSubText: {
    fontSize: 14,
    color: '#888',
    marginBottom: 16,
  },
  emptyStateButton: {
    marginTop: 10,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 20,
  },
  calendarButton: {
    flex: 1,
    marginHorizontal: 4,
    backgroundColor: '#FF9800',
  },
  rewardsButton: {
    flex: 1,
    marginHorizontal: 4,
    backgroundColor: '#9C27B0',
  },
  walletButton: {
    flex: 1,
    marginHorizontal: 4,
    backgroundColor: '#66BB6A',
  },
});

export default ParentDashboard;