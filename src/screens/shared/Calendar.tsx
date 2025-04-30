import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  StatusBar, 
  TouchableOpacity,
  Alert
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { AppState, CalendarEvent, Chore } from '../../types';
import { theme } from '../../constants/theme';
import { Feather } from '@expo/vector-icons';
import CalendarView from '../../components/common/CalendarView';
import { useCalendar } from '../../hooks/useCalendar';
import { fetchChores } from '../../store/slices/choresSlice';
import { requestCalendarPermissions } from '../../utils/calendar';

const Calendar: React.FC<{ navigation: any }> = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: AppState) => state.auth);
  const { chores } = useSelector((state: AppState) => state.chores);
  const [selectedDate, setSelectedDate] = useState<string | undefined>(
    new Date().toISOString().split('T')[0]
  );
  const [showAgenda, setShowAgenda] = useState(false);
  
  const { 
    calendarEvents, 
    calendarId, 
    loading, 
    error, 
    createEventFromChore 
  } = useCalendar();
  
  useEffect(() => {
    if (user?.uid) {
      dispatch(fetchChores(user.uid));
      
      // Request calendar permissions
      requestCalendarPermissions().then(granted => {
        if (!granted) {
          Alert.alert(
            'Calendar Access Denied',
            'Calendar features will be limited. You can enable calendar access in your device settings.'
          );
        }
      });
    }
  }, [dispatch, user?.uid]);
  
  const handleGoBack = () => {
    navigation.goBack();
  };
  
  const handleDayPress = (day: any) => {
    setSelectedDate(day.dateString);
  };
  
  const handleEventPress = (event: CalendarEvent) => {
    // If event is linked to a chore, navigate to chore details
    if (event.choreId && chores[event.choreId]) {
      navigation.navigate('ChoreDetails', { chore: chores[event.choreId] });
    } else {
      Alert.alert('Event Details', event.title);
    }
  };
  
  const toggleViewMode = () => {
    setShowAgenda(!showAgenda);
  };
  
  // Convert chores to calendar events format
  const getChoreEvents = (): CalendarEvent[] => {
    const events: CalendarEvent[] = [...calendarEvents];
    
    // Add any chores that don't have a corresponding calendar event
    Object.values(chores).forEach(chore => {
      const existingEvent = calendarEvents.find(event => event.choreId === chore.id);
      
      if (!existingEvent) {
        events.push({
          id: `temp_${chore.id}`,
          title: chore.title,
          description: chore.description,
          startDate: chore.dueDate,
          endDate: chore.dueDate + (60 * 60 * 1000), // 1 hour later
          allDay: false,
          choreId: chore.id,
          color: getStatusColor(chore.status),
        });
      }
    });
    
    return events;
  };
  
  // Get color based on chore status
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'completed':
        return theme.colors.success;
      case 'overdue':
        return theme.colors.error;
      default:
        return theme.colors.primary;
    }
  };

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
        <Text style={styles.headerTitle}>Calendar</Text>
        <TouchableOpacity onPress={toggleViewMode} style={styles.viewModeButton}>
          <Feather name={showAgenda ? "calendar" : "list"} size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>
      
      <CalendarView
        events={getChoreEvents()}
        onEventPress={handleEventPress}
        onDayPress={handleDayPress}
        selectedDate={selectedDate}
        showAgenda={showAgenda}
        style={styles.calendar}
      />
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
  viewModeButton: {
    padding: 8,
  },
  calendar: {
    flex: 1,
  },
});

export default Calendar;
