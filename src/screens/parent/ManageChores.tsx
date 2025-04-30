import React, { useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  StatusBar, 
  TouchableOpacity, 
  ScrollView,
  FlatList
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppState, Chore } from '../../types';
import { theme } from '../../constants/theme';
import ChoreForm from '../../components/parent/ChoreForm';
import { Feather } from '@expo/vector-icons';
import { fetchChores, deleteChore } from '../../store/slices/choresSlice';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { useRoute } from '@react-navigation/native';
import { formatDate } from '../../utils/formatters';
import { Alert } from 'react-native';

interface RouteParams {
  mode?: 'add' | 'edit';
  choreId?: string;
}

const ManageChores: React.FC<{ navigation: any }> = ({ navigation }) => {
  const dispatch = useDispatch();
  const route = useRoute();
  const params = route.params as RouteParams || {};
  const { mode = 'list', choreId } = params;
  
  const { user } = useSelector((state: AppState) => state.auth);
  const { chores, loading } = useSelector((state: AppState) => state.chores);
  const { children } = useSelector((state: AppState) => state.children);
  
  const choresList = Object.values(chores);
  const selectedChore = choreId ? chores[choreId] : undefined;

  useEffect(() => {
    if (user?.uid) {
      dispatch(fetchChores(user.uid));
    }
  }, [dispatch, user?.uid]);

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleSuccess = () => {
    navigation.goBack();
  };

  const handleAddChore = () => {
    navigation.navigate('ManageChores', { mode: 'add' });
  };

  const handleEditChore = (chore: Chore) => {
    navigation.navigate('ManageChores', { mode: 'edit', choreId: chore.id });
  };

  const handleDeleteChore = (chore: Chore) => {
    Alert.alert(
      'Delete Chore',
      `Are you sure you want to delete "${chore.title}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await dispatch(deleteChore(chore.id));
          },
        },
      ]
    );
  };

  const getChildName = (childId: string) => {
    return children[childId]?.name || 'Unknown';
  };

  const renderChoreItem = ({ item }: { item: Chore }) => (
    <Card key={item.id} style={styles.choreCard}>
      <View style={styles.choreHeader}>
        <Text style={styles.choreTitle}>{item.title}</Text>
        <Badge 
          label={item.status.charAt(0).toUpperCase() + item.status.slice(1)} 
          type={
            item.status === 'completed' ? 'success' : 
            item.status === 'overdue' ? 'error' : 'primary'
          }
          size="small"
        />
      </View>
      
      {item.description ? (
        <Text style={styles.choreDescription} numberOfLines={2}>
          {item.description}
        </Text>
      ) : null}
      
      <View style={styles.choreDetails}>
        <View style={styles.choreDetail}>
          <Feather name="user" size={16} color={theme.colors.textSecondary} />
          <Text style={styles.choreDetailText}>{getChildName(item.assignedTo)}</Text>
        </View>
        
        <View style={styles.choreDetail}>
          <Feather name="calendar" size={16} color={theme.colors.textSecondary} />
          <Text style={styles.choreDetailText}>{formatDate(new Date(item.dueDate))}</Text>
        </View>
        
        <View style={styles.choreDetail}>
          <Feather name="award" size={16} color={theme.colors.textSecondary} />
          <Text style={styles.choreDetailText}>{item.pointValue} points</Text>
        </View>
      </View>
      
      <View style={styles.choreActions}>
        <Button
          title="Edit"
          onPress={() => handleEditChore(item)}
          type="outline"
          size="small"
          style={styles.actionButton}
          icon={<Feather name="edit" size={16} color={theme.colors.primary} style={{ marginRight: 8 }} />}
        />
        <Button
          title="Delete"
          onPress={() => handleDeleteChore(item)}
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
          {mode === 'add' ? 'Add Chore' : mode === 'edit' ? 'Edit Chore' : 'Manage Chores'}
        </Text>
        {mode === 'list' && (
          <TouchableOpacity onPress={handleAddChore} style={styles.addButton}>
            <Feather name="plus" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
        )}
        {(mode === 'add' || mode === 'edit') && <View style={styles.placeholder} />}
      </View>

      {mode === 'add' && (
        <ChoreForm onSuccess={handleSuccess} />
      )}

      {mode === 'edit' && selectedChore && (
        <ChoreForm existingChore={selectedChore} onSuccess={handleSuccess} />
      )}

      {mode === 'list' && (
        <FlatList
          data={choresList}
          renderItem={renderChoreItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Feather name="clipboard" size={50} color={theme.colors.textSecondary} />
              <Text style={styles.emptyText}>No chores added yet</Text>
              <Button 
                title="Add Chore" 
                onPress={handleAddChore} 
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
  choreCard: {
    marginBottom: 12,
  },
  choreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  choreTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    flex: 1,
  },
  choreDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 12,
  },
  choreDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  choreDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
  },
  choreDetailText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginLeft: 6,
  },
  choreActions: {
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

export default ManageChores;
