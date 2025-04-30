import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Switch } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppState, Chore, RecurringPattern } from '../../types';
import Input from '../common/Input';
import Button from '../common/Button';
import { theme } from '../../constants/theme';
import { Feather } from '@expo/vector-icons';
import { addChore, updateChore } from '../../store/slices/choresSlice';
import { Formik } from 'formik';
import * as Yup from 'yup';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { useCalendar } from '../../hooks/useCalendar';

interface ChoreFormProps {
  existingChore?: Chore;
  onSuccess: () => void;
}

const ChoreSchema = Yup.object().shape({
  title: Yup.string()
    .min(2, 'Too Short!')
    .max(50, 'Too Long!')
    .required('Required'),
  description: Yup.string()
    .max(200, 'Too Long!'),
  pointValue: Yup.number()
    .min(1, 'Must be at least 1 point')
    .max(100, 'Must be at most 100 points')
    .required('Required'),
  assignedTo: Yup.string()
    .required('Please assign to a child'),
});

const ChoreForm: React.FC<ChoreFormProps> = ({ existingChore, onSuccess }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: AppState) => state.auth);
  const { children } = useSelector((state: AppState) => state.children);
  const { createEventFromChore, updateChoreEvent } = useCalendar();
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // Initialize due date to today at noon if no existing chore
  const defaultDueDate = new Date();
  defaultDueDate.setHours(12, 0, 0, 0);
  
  const initialValues = {
    title: existingChore?.title || '',
    description: existingChore?.description || '',
    pointValue: existingChore?.pointValue?.toString() || '5',
    dueDate: existingChore ? new Date(existingChore.dueDate) : defaultDueDate,
    assignedTo: existingChore?.assignedTo || '',
    isRecurring: existingChore?.isRecurring || false,
    recurringFrequency: existingChore?.recurringPattern?.frequency || 'daily',
    recurringInterval: existingChore?.recurringPattern?.interval?.toString() || '1',
  };

  const handleSubmit = async (values: any) => {
    if (!user?.uid) return;

    try {
      const choreData: Partial<Chore> = {
        title: values.title,
        description: values.description,
        pointValue: parseInt(values.pointValue, 10),
        dueDate: values.dueDate.getTime(),
        assignedTo: values.assignedTo,
        isRecurring: values.isRecurring,
        status: existingChore?.status || 'pending',
        createdBy: user.uid,
      };
      
      // Add recurring pattern if enabled
      if (values.isRecurring) {
        choreData.recurringPattern = {
          frequency: values.recurringFrequency,
          interval: parseInt(values.recurringInterval, 10),
        };
      }
      
      if (existingChore) {
        // Update existing chore
        await dispatch(updateChore({
          ...choreData,
          id: existingChore.id,
        }));
        
        // Update calendar event
        if (choreData.id) {
          await updateChoreEvent(choreData as Chore);
        }
      } else {
        // Add new chore
        const newChore = await dispatch(addChore(choreData));
        
        // Create calendar event
        if (newChore.payload?.id) {
          await createEventFromChore(newChore.payload as Chore);
        }
      }
      
      onSuccess();
    } catch (error) {
      Alert.alert('Error', 'Failed to save chore');
    }
  };

  const childrenArray = Object.values(children);

  return (
    <ScrollView style={styles.container}>
      <Formik
        initialValues={initialValues}
        validationSchema={ChoreSchema}
        onSubmit={handleSubmit}
      >
        {({ handleChange, handleBlur, handleSubmit, setFieldValue, values, errors, touched }) => (
          <View style={styles.formContainer}>
            <Input
              label="Chore Title"
              placeholder="Enter chore title"
              value={values.title}
              onChangeText={handleChange('title')}
              onBlur={handleBlur('title')}
              error={errors.title}
              touched={touched.title}
              leftIcon={<Feather name="check-square" size={20} color={theme.colors.textSecondary} />}
            />
            
            <Input
              label="Description"
              placeholder="Enter chore description"
              value={values.description}
              onChangeText={handleChange('description')}
              onBlur={handleBlur('description')}
              error={errors.description}
              touched={touched.description}
              multiline
              numberOfLines={3}
              leftIcon={<Feather name="file-text" size={20} color={theme.colors.textSecondary} />}
              optional
            />
            
            <Input
              label="Point Value"
              placeholder="Enter point value"
              value={values.pointValue}
              onChangeText={handleChange('pointValue')}
              onBlur={handleBlur('pointValue')}
              error={errors.pointValue}
              touched={touched.pointValue}
              keyboardType="numeric"
              leftIcon={<Feather name="award" size={20} color={theme.colors.textSecondary} />}
            />
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Due Date</Text>
              <Button
                title={values.dueDate.toLocaleString()}
                onPress={() => setShowDatePicker(true)}
                type="outline"
                icon={<Feather name="calendar" size={20} color={theme.colors.primary} style={{ marginRight: 8 }} />}
              />
              
              {showDatePicker && (
                <DateTimePicker
                  value={values.dueDate}
                  mode="datetime"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(false);
                    if (selectedDate) {
                      setFieldValue('dueDate', selectedDate);
                    }
                  }}
                />
              )}
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Assign To</Text>
              {childrenArray.length === 0 ? (
                <Text style={styles.noChildrenText}>
                  No children profiles found. Please add a child profile first.
                </Text>
              ) : (
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={values.assignedTo}
                    onValueChange={(itemValue) => setFieldValue('assignedTo', itemValue)}
                    style={styles.picker}
                  >
                    <Picker.Item label="Select a child" value="" />
                    {childrenArray.map(child => (
                      <Picker.Item key={child.id} label={child.name} value={child.id} />
                    ))}
                  </Picker>
                </View>
              )}
              {errors.assignedTo && touched.assignedTo && (
                <Text style={styles.errorText}>{errors.assignedTo}</Text>
              )}
            </View>
            
            <View style={styles.switchContainer}>
              <Text style={styles.label}>Recurring Chore</Text>
              <Switch
                value={values.isRecurring}
                onValueChange={(value) => setFieldValue('isRecurring', value)}
                trackColor={{ false: theme.colors.lightGray, true: theme.colors.primaryLight }}
                thumbColor={values.isRecurring ? theme.colors.primary : '#f4f3f4'}
              />
            </View>
            
            {values.isRecurring && (
              <View style={styles.recurringContainer}>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Frequency</Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={values.recurringFrequency}
                      onValueChange={(itemValue) => setFieldValue('recurringFrequency', itemValue)}
                      style={styles.picker}
                    >
                      <Picker.Item label="Daily" value="daily" />
                      <Picker.Item label="Weekly" value="weekly" />
                      <Picker.Item label="Monthly" value="monthly" />
                    </Picker>
                  </View>
                </View>
                
                <Input
                  label="Repeat every"
                  placeholder="Enter interval"
                  value={values.recurringInterval}
                  onChangeText={handleChange('recurringInterval')}
                  onBlur={handleBlur('recurringInterval')}
                  keyboardType="numeric"
                  rightIcon={
                    <Text style={styles.intervalLabel}>
                      {values.recurringFrequency === 'daily' ? 'days' : 
                       values.recurringFrequency === 'weekly' ? 'weeks' : 'months'}
                    </Text>
                  }
                />
              </View>
            )}
            
            <Button
              title={existingChore ? "Update Chore" : "Create Chore"}
              onPress={handleSubmit}
              type="primary"
              fullWidth
              style={styles.submitButton}
            />
          </View>
        )}
      </Formik>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  formContainer: {
    padding: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: 6,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  picker: {
    height: 50,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 8,
  },
  recurringContainer: {
    padding: 12,
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: 10,
    marginBottom: 16,
  },
  intervalLabel: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  errorText: {
    fontSize: 12,
    color: theme.colors.error,
    marginTop: 4,
  },
  noChildrenText: {
    color: theme.colors.error,
    fontSize: 14,
    marginTop: 4,
  },
  submitButton: {
    marginTop: 16,
  },
});

export default ChoreForm;
