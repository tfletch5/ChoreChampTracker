import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Calendar, CalendarList, Agenda } from 'react-native-calendars';
import { theme } from '../../constants/theme';
import { CalendarEvent } from '../../types';
import Card from './Card';
import { Feather } from '@expo/vector-icons';
import { formatTime } from '../../utils/formatters';

interface CalendarViewProps {
  events: CalendarEvent[];
  onEventPress?: (event: CalendarEvent) => void;
  onDayPress?: (date: any) => void;
  selectedDate?: string; // YYYY-MM-DD format
  showAgenda?: boolean;
  style?: any;
}

const CalendarView: React.FC<CalendarViewProps> = ({
  events,
  onEventPress,
  onDayPress,
  selectedDate,
  showAgenda = false,
  style
}) => {
  const [currentDate, setCurrentDate] = useState(selectedDate || new Date().toISOString().split('T')[0]);

  // Transform events for calendar marking
  const getMarkedDates = () => {
    const markedDates: any = {};
    
    if (selectedDate) {
      markedDates[selectedDate] = { selected: true, selectedColor: theme.colors.primary };
    }
    
    events.forEach(event => {
      const dateStr = new Date(event.startDate).toISOString().split('T')[0];
      
      if (markedDates[dateStr]) {
        // If already marked, update with dots
        markedDates[dateStr] = {
          ...markedDates[dateStr],
          dots: markedDates[dateStr].dots ? 
            [...markedDates[dateStr].dots, { color: event.color || theme.colors.primary }] : 
            [{ color: event.color || theme.colors.primary }],
          marked: true,
        };
      } else {
        // Mark new date
        markedDates[dateStr] = {
          marked: true,
          dots: [{ color: event.color || theme.colors.primary }],
        };
      }
    });
    
    return markedDates;
  };

  // Format events for agenda display
  const getAgendaItems = () => {
    const items: any = {};
    
    events.forEach(event => {
      const dateStr = new Date(event.startDate).toISOString().split('T')[0];
      
      if (!items[dateStr]) {
        items[dateStr] = [];
      }
      
      items[dateStr].push({
        ...event,
        height: 80,
        day: dateStr,
      });
    });
    
    return items;
  };

  // Handle date selection
  const handleDayPress = (day: any) => {
    setCurrentDate(day.dateString);
    if (onDayPress) {
      onDayPress(day);
    }
  };

  // Filter events for the selected date
  const getEventsForSelectedDate = () => {
    return events.filter(event => {
      const eventDate = new Date(event.startDate).toISOString().split('T')[0];
      return eventDate === currentDate;
    });
  };

  // Render the list of events for the selected date
  const renderEventsList = () => {
    const filteredEvents = getEventsForSelectedDate();
    
    if (filteredEvents.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Feather name="calendar" size={50} color={theme.colors.textSecondary} />
          <Text style={styles.emptyText}>No events for this day</Text>
        </View>
      );
    }
    
    return (
      <ScrollView style={styles.eventsContainer}>
        {filteredEvents.map(event => (
          <TouchableOpacity
            key={event.id}
            onPress={() => onEventPress && onEventPress(event)}
            activeOpacity={0.7}
          >
            <Card style={styles.eventCard}>
              <View style={[styles.eventColor, { backgroundColor: event.color || theme.colors.primary }]} />
              <View style={styles.eventContent}>
                <Text style={styles.eventTitle}>{event.title}</Text>
                <Text style={styles.eventTime}>
                  {formatTime(new Date(event.startDate))} - {formatTime(new Date(event.endDate))}
                </Text>
                {event.description && (
                  <Text numberOfLines={2} style={styles.eventDescription}>
                    {event.description}
                  </Text>
                )}
              </View>
            </Card>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  if (showAgenda) {
    return (
      <View style={[styles.container, style]}>
        <Agenda
          items={getAgendaItems()}
          selected={currentDate}
          renderItem={(item: CalendarEvent) => (
            <TouchableOpacity
              style={styles.agendaItem}
              onPress={() => onEventPress && onEventPress(item)}
            >
              <View style={[styles.agendaItemColor, { backgroundColor: item.color || theme.colors.primary }]} />
              <View style={styles.agendaItemContent}>
                <Text style={styles.agendaItemTitle}>{item.title}</Text>
                <Text style={styles.agendaItemTime}>
                  {formatTime(new Date(item.startDate))} - {formatTime(new Date(item.endDate))}
                </Text>
                {item.description && (
                  <Text numberOfLines={1} style={styles.agendaItemDescription}>
                    {item.description}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          )}
          renderEmptyData={() => (
            <View style={styles.emptyContainer}>
              <Feather name="calendar" size={50} color={theme.colors.textSecondary} />
              <Text style={styles.emptyText}>No events for this day</Text>
            </View>
          )}
          theme={{
            selectedDayBackgroundColor: theme.colors.primary,
            dotColor: theme.colors.primary,
            todayTextColor: theme.colors.primary,
          }}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <Calendar
        markedDates={getMarkedDates()}
        onDayPress={handleDayPress}
        enableSwipeMonths
        theme={{
          selectedDayBackgroundColor: theme.colors.primary,
          dotColor: theme.colors.primary,
          todayTextColor: theme.colors.primary,
        }}
      />
      <View style={styles.divider} />
      {renderEventsList()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: 10,
  },
  eventsContainer: {
    flex: 1,
    paddingHorizontal: 10,
  },
  eventCard: {
    flexDirection: 'row',
    padding: 12,
    marginVertical: 6,
  },
  eventColor: {
    width: 6,
    borderRadius: 3,
    marginRight: 12,
  },
  eventContent: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  eventTime: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  eventDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 6,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginTop: 10,
  },
  agendaItem: {
    backgroundColor: 'white',
    flexDirection: 'row',
    padding: 10,
    marginRight: 10,
    marginVertical: 5,
    borderRadius: 5,
    ...theme.shadows.small,
  },
  agendaItemColor: {
    width: 6,
    borderRadius: 3,
    marginRight: 10,
  },
  agendaItemContent: {
    flex: 1,
  },
  agendaItemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  agendaItemTime: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  agendaItemDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
});

export default CalendarView;
