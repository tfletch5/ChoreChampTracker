import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  StatusBar, 
  TouchableOpacity, 
  FlatList, 
  TextInput,
  Alert
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppState, SharedList, SharedListItem } from '../../types';
import { theme } from '../../constants/theme';
import { Feather } from '@expo/vector-icons';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { fetchLists, addList, updateList, deleteList, addListItem, updateListItem, deleteListItem } from '../../store/slices/listsSlice';

const SharedLists: React.FC<{ navigation: any }> = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: AppState) => state.auth);
  const { lists, loading } = useSelector((state: AppState) => state.lists);
  
  const [selectedList, setSelectedList] = useState<SharedList | null>(null);
  const [newListTitle, setNewListTitle] = useState('');
  const [newItemText, setNewItemText] = useState('');
  const [showAddList, setShowAddList] = useState(false);
  const [listType, setListType] = useState<'shopping' | 'project' | 'notes'>('shopping');
  
  // Convert the lists object to an array
  const listArray = Object.values(lists);

  useEffect(() => {
    if (user?.uid) {
      dispatch(fetchLists(user.uid));
    }
  }, [dispatch, user?.uid]);

  const handleGoBack = () => {
    if (selectedList) {
      setSelectedList(null);
    } else {
      navigation.goBack();
    }
  };

  const handleAddList = () => {
    if (!newListTitle.trim()) {
      Alert.alert('Error', 'Please enter a list title');
      return;
    }

    const newList = {
      title: newListTitle,
      type: listType,
      items: [],
      createdBy: user!.uid,
    };

    dispatch(addList(newList));
    setNewListTitle('');
    setShowAddList(false);
  };

  const handleAddItem = () => {
    if (!newItemText.trim() || !selectedList) return;

    const newItem: Omit<SharedListItem, 'id'> = {
      text: newItemText,
      completed: false,
      createdBy: user!.uid,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    dispatch(addListItem({
      listId: selectedList.id,
      item: newItem
    }));
    setNewItemText('');
  };

  const handleToggleItem = (item: SharedListItem) => {
    if (!selectedList) return;

    dispatch(updateListItem({
      listId: selectedList.id,
      itemId: item.id,
      updates: {
        completed: !item.completed,
        updatedAt: Date.now()
      }
    }));
  };

  const handleDeleteItem = (item: SharedListItem) => {
    if (!selectedList) return;

    dispatch(deleteListItem({
      listId: selectedList.id,
      itemId: item.id
    }));
  };

  const handleSelectList = (list: SharedList) => {
    setSelectedList(list);
  };

  const handleDeleteList = (list: SharedList) => {
    Alert.alert(
      'Delete List',
      `Are you sure you want to delete "${list.title}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            dispatch(deleteList(list.id));
            if (selectedList?.id === list.id) {
              setSelectedList(null);
            }
          },
        },
      ]
    );
  };

  const renderListItem = ({ item }: { item: SharedList }) => (
    <Card 
      style={styles.listCard} 
      onPress={() => handleSelectList(item)}
    >
      <View style={styles.listHeader}>
        <View style={styles.listTitleContainer}>
          {item.type === 'shopping' && <Feather name="shopping-cart" size={20} color={theme.colors.primary} style={styles.listIcon} />}
          {item.type === 'project' && <Feather name="clipboard" size={20} color={theme.colors.secondary} style={styles.listIcon} />}
          {item.type === 'notes' && <Feather name="file-text" size={20} color={theme.colors.warning} style={styles.listIcon} />}
          <Text style={styles.listTitle}>{item.title}</Text>
        </View>
        <TouchableOpacity onPress={() => handleDeleteList(item)}>
          <Feather name="trash-2" size={20} color={theme.colors.error} />
        </TouchableOpacity>
      </View>
      
      <Text style={styles.listInfo}>
        {item.items.length} items • {item.items.filter(i => i.completed).length} completed
      </Text>
    </Card>
  );

  const renderSharedListItem = ({ item }: { item: SharedListItem }) => (
    <View style={styles.listItemContainer}>
      <TouchableOpacity 
        style={styles.checkboxContainer} 
        onPress={() => handleToggleItem(item)}
      >
        {item.completed ? (
          <Feather name="check-square" size={20} color={theme.colors.primary} />
        ) : (
          <Feather name="square" size={20} color={theme.colors.textSecondary} />
        )}
      </TouchableOpacity>
      
      <Text style={[
        styles.listItemText,
        item.completed && styles.completedItemText
      ]}>
        {item.text}
      </Text>
      
      <TouchableOpacity onPress={() => handleDeleteItem(item)}>
        <Feather name="x" size={20} color={theme.colors.textSecondary} />
      </TouchableOpacity>
    </View>
  );

  const renderListTypeButton = (type: 'shopping' | 'project' | 'notes', label: string, icon: string) => (
    <TouchableOpacity 
      style={[styles.typeButton, listType === type && styles.selectedTypeButton]} 
      onPress={() => setListType(type)}
    >
      <Feather 
        name={icon as any} 
        size={16} 
        color={listType === type ? theme.colors.primary : theme.colors.textSecondary} 
      />
      <Text 
        style={[
          styles.typeButtonText, 
          listType === type && styles.selectedTypeButtonText
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
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
          {selectedList ? selectedList.title : 'Shared Lists'}
        </Text>
        {!selectedList && !showAddList && (
          <TouchableOpacity onPress={() => setShowAddList(true)} style={styles.addButton}>
            <Feather name="plus" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
        )}
        {(selectedList || showAddList) && <View style={styles.placeholder} />}
      </View>

      {showAddList && (
        <View style={styles.addListContainer}>
          <Text style={styles.addListLabel}>Create a New List</Text>
          <TextInput
            style={styles.addListInput}
            placeholder="Enter list title"
            value={newListTitle}
            onChangeText={setNewListTitle}
            autoFocus
          />
          
          <View style={styles.listTypeContainer}>
            {renderListTypeButton('shopping', 'Shopping', 'shopping-cart')}
            {renderListTypeButton('project', 'Project', 'clipboard')}
            {renderListTypeButton('notes', 'Notes', 'file-text')}
          </View>
          
          <View style={styles.addListActions}>
            <Button
              title="Cancel"
              onPress={() => setShowAddList(false)}
              type="outline"
              style={styles.addListActionButton}
            />
            <Button
              title="Create"
              onPress={handleAddList}
              type="primary"
              style={styles.addListActionButton}
            />
          </View>
        </View>
      )}

      {!showAddList && selectedList && (
        <>
          <View style={styles.addItemContainer}>
            <TextInput
              style={styles.addItemInput}
              placeholder="Add a new item..."
              value={newItemText}
              onChangeText={setNewItemText}
              onSubmitEditing={handleAddItem}
            />
            <TouchableOpacity style={styles.addItemButton} onPress={handleAddItem}>
              <Feather name="plus" size={24} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={selectedList.items}
            renderItem={renderSharedListItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listItemsContent}
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                <Feather name="list" size={50} color={theme.colors.textSecondary} />
                <Text style={styles.emptyText}>No items in this list yet</Text>
                <Text style={styles.emptySubtext}>Add items using the field above</Text>
              </View>
            )}
          />
        </>
      )}

      {!showAddList && !selectedList && (
        <FlatList
          data={listArray}
          renderItem={renderListItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listsContent}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Feather name="list" size={50} color={theme.colors.textSecondary} />
              <Text style={styles.emptyText}>No lists yet</Text>
              <Button 
                title="Create a List" 
                onPress={() => setShowAddList(true)} 
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
  listsContent: {
    padding: 16,
    paddingBottom: 24,
  },
  listCard: {
    marginBottom: 12,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  listTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  listIcon: {
    marginRight: 8,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    flex: 1,
  },
  listInfo: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  addListContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  addListLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 12,
  },
  addListInput: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  listTypeContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 20,
    marginRight: 8,
  },
  selectedTypeButton: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight,
  },
  typeButtonText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginLeft: 4,
  },
  selectedTypeButtonText: {
    color: theme.colors.primary,
    fontWeight: '500',
  },
  addListActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  addListActionButton: {
    marginLeft: 8,
    minWidth: 100,
  },
  addItemContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  addItemInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginRight: 8,
  },
  addItemButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listItemsContent: {
    padding: 16,
    paddingBottom: 24,
  },
  listItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  checkboxContainer: {
    marginRight: 12,
  },
  listItemText: {
    fontSize: 16,
    color: theme.colors.text,
    flex: 1,
  },
  completedItemText: {
    textDecorationLine: 'line-through',
    color: theme.colors.textSecondary,
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
  emptySubtext: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});

export default SharedLists;
