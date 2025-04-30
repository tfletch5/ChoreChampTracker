import { useState, useEffect } from 'react';
import * as Calendar from 'expo-calendar';
import { Platform } from 'react-native';
import { CalendarEvent, Chore } from '../types';
import { useSelector } from 'react-redux';
import { AppState } from '../types';
import { where } from 'firebase/firestore';
import { useFirestore } from './useFirestore';

export const useCalendar = () => {
  const [calendarId, setCalendarId] = useState<string | null>(null);
  const [calendars, setCalendars] = useState<Calendar.Calendar[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useSelector((state: AppState) => state.auth);
  
  const {
    documents: calendarEvents,
    addDocument: addCalendarEvent,
    updateDocument: updateCalendarEvent,
    deleteDocument: deleteCalendarEvent,
  } = useFirestore<CalendarEvent>({
    collectionName: 'calendarEvents',
    orderByField: 'startDate',
    orderDirection: 'asc',
    whereConstraints: user ? [where('userId', '==', user.uid)] : [],
  });

  // Request calendar permissions and get calendars
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const { status } = await Calendar.requestCalendarPermissionsAsync();
        
        if (status !== 'granted') {
          setError('Calendar permission not granted');
          return;
        }
        
        // Get all available calendars
        const userCalendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
        setCalendars(userCalendars);
        
        // Find or create a calendar for the app
        const appCalendarId = await findOrCreateAppCalendar();
        setCalendarId(appCalendarId);
      } catch (err: any) {
        console.error('Calendar error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [user?.uid]);
  
  // Find or create the app's calendar
  const findOrCreateAppCalendar = async (): Promise<string | null> => {
    try {
      const userCalendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      
      // Look for existing ChoreChamp calendar
      const choreChampCalendar = userCalendars.find(calendar => 
        calendar.title === 'ChoreChamp' || 
        calendar.name === 'ChoreChamp'
      );
      
      if (choreChampCalendar) {
        return choreChampCalendar.id;
      }
      
      // Create a new calendar for the app
      const defaultCalendarSource = Platform.OS === 'ios' 
        ? await getDefaultCalendarSource()
        : { isLocalAccount: true, name: 'ChoreChamp' };
      
      const newCalendarId = await Calendar.createCalendarAsync({
        title: 'ChoreChamp',
        color: '#6C63FF',
        entityType: Calendar.EntityTypes.EVENT,
        name: 'ChoreChamp',
        accessLevel: Calendar.CalendarAccessLevel.OWNER,
        ownerAccount: 'personal',
        source: defaultCalendarSource,
      });
      
      return newCalendarId;
    } catch (err: any) {
      console.error('Error finding/creating calendar:', err);
      setError(err.message);
      return null;
    }
  };
  
  // Helper for iOS to get default calendar source
  const getDefaultCalendarSource = async () => {
    const defaultCalendars = await Calendar.getCalendarsAsync(
      Calendar.EntityTypes.EVENT
    );
    return defaultCalendars.find(cal => cal.source.name === 'Default')?.source;
  };
  
  // Create calendar event from chore
  const createEventFromChore = async (chore: Chore): Promise<string | null> => {
    if (!calendarId) {
      setError('No calendar available');
      return null;
    }
    
    try {
      // Create event in device calendar
      const eventStartDate = new Date(chore.dueDate);
      const eventEndDate = new Date(chore.dueDate);
      eventEndDate.setHours(eventEndDate.getHours() + 1);
      
      const eventId = await Calendar.createEventAsync(calendarId, {
        title: chore.title,
        startDate: eventStartDate,
        endDate: eventEndDate,
        allDay: false,
        notes: chore.description,
        alarms: [{ relativeOffset: -60 }], // Reminder 1 hour before
      });
      
      // Save event reference in Firestore
      if (eventId && user) {
        const calendarEvent: Omit<CalendarEvent, 'id'> = {
          title: chore.title,
          description: chore.description,
          startDate: chore.dueDate,
          endDate: chore.dueDate + (60 * 60 * 1000), // 1 hour later
          allDay: false,
          choreId: chore.id,
          calendarId: calendarId,
          externalId: eventId,
          color: '#6C63FF',
        };
        
        await addCalendarEvent(calendarEvent);
      }
      
      return eventId;
    } catch (err: any) {
      console.error('Error creating event:', err);
      setError(err.message);
      return null;
    }
  };
  
  // Update calendar event when chore is updated
  const updateChoreEvent = async (chore: Chore): Promise<boolean> => {
    if (!calendarId) {
      setError('No calendar available');
      return false;
    }
    
    try {
      // Find the existing event for this chore
      const existingEvent = calendarEvents.find(event => event.choreId === chore.id);
      
      if (!existingEvent) {
        // If no event exists, create a new one
        await createEventFromChore(chore);
        return true;
      }
      
      // Update the existing event in device calendar
      const eventStartDate = new Date(chore.dueDate);
      const eventEndDate = new Date(chore.dueDate);
      eventEndDate.setHours(eventEndDate.getHours() + 1);
      
      await Calendar.updateEventAsync(existingEvent.externalId!, {
        title: chore.title,
        startDate: eventStartDate,
        endDate: eventEndDate,
        notes: chore.description,
      });
      
      // Update the event reference in Firestore
      await updateCalendarEvent(existingEvent.id, {
        title: chore.title,
        description: chore.description,
        startDate: chore.dueDate,
        endDate: chore.dueDate + (60 * 60 * 1000), // 1 hour later
      });
      
      return true;
    } catch (err: any) {
      console.error('Error updating event:', err);
      setError(err.message);
      return false;
    }
  };
  
  // Delete calendar event when chore is deleted
  const deleteChoreEvent = async (choreId: string): Promise<boolean> => {
    try {
      // Find the existing event for this chore
      const existingEvent = calendarEvents.find(event => event.choreId === choreId);
      
      if (!existingEvent) {
        return true; // No event to delete
      }
      
      // Delete the event from device calendar
      if (existingEvent.externalId) {
        await Calendar.deleteEventAsync(existingEvent.externalId);
      }
      
      // Delete the event reference from Firestore
      await deleteCalendarEvent(existingEvent.id);
      
      return true;
    } catch (err: any) {
      console.error('Error deleting event:', err);
      setError(err.message);
      return false;
    }
  };

  return {
    calendarId,
    calendars,
    calendarEvents,
    loading,
    error,
    createEventFromChore,
    updateChoreEvent,
    deleteChoreEvent,
  };
};
