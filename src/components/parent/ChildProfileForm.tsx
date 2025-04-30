import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppState, ChildProfile } from '../../types';
import Input from '../common/Input';
import Button from '../common/Button';
import Avatar from '../common/Avatar';
import { theme } from '../../constants/theme';
import { Feather } from '@expo/vector-icons';
import { addChild, updateChild } from '../../store/slices/childrenSlice';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useStorage } from '../../hooks/useStorage';

interface ChildProfileFormProps {
  existingChild?: ChildProfile;
  onSuccess: () => void;
}

const ChildProfileSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Too Short!')
    .max(50, 'Too Long!')
    .required('Required'),
  age: Yup.number()
    .min(3, 'Child must be at least 3 years old')
    .max(18, 'Child must be at most 18 years old')
    .required('Required'),
});

const ChildProfileForm: React.FC<ChildProfileFormProps> = ({ existingChild, onSuccess }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: AppState) => state.auth);
  const { uploading, pickAndUploadImage } = useStorage('avatars');
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(existingChild?.avatarURL);

  const initialValues = {
    name: existingChild?.name || '',
    age: existingChild?.age.toString() || '',
  };

  const handleAvatarPress = async () => {
    try {
      const url = await pickAndUploadImage();
      if (url) {
        setAvatarUrl(url);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to upload image');
    }
  };

  const handleSubmit = async (values: { name: string; age: string }) => {
    if (!user?.uid) return;

    try {
      if (existingChild) {
        // Update existing child
        await dispatch(updateChild({
          id: existingChild.id,
          name: values.name,
          age: parseInt(values.age, 10),
          avatarURL: avatarUrl || existingChild.avatarURL,
        }));
      } else {
        // Add new child
        await dispatch(addChild({
          name: values.name,
          age: parseInt(values.age, 10),
          avatarURL: avatarUrl || '',
          parentId: user.uid,
        }));
      }
      onSuccess();
    } catch (error) {
      Alert.alert('Error', 'Failed to save child profile');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Formik
        initialValues={initialValues}
        validationSchema={ChildProfileSchema}
        onSubmit={handleSubmit}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
          <View style={styles.formContainer}>
            <View style={styles.avatarContainer}>
              <Avatar 
                source={avatarUrl}
                size={120}
                initials={values.name ? values.name.substring(0, 2).toUpperCase() : ''}
                borderColor={theme.colors.primary}
                borderWidth={3}
                onPress={handleAvatarPress}
                style={styles.avatar}
              />
              <Button
                title="Change Avatar"
                onPress={handleAvatarPress}
                type="text"
                size="small"
                loading={uploading}
                icon={<Feather name="camera" size={16} color={theme.colors.primary} style={{ marginRight: 8 }} />}
              />
            </View>
            
            <Input
              label="Child's Name"
              placeholder="Enter child's name"
              value={values.name}
              onChangeText={handleChange('name')}
              onBlur={handleBlur('name')}
              error={errors.name}
              touched={touched.name}
              leftIcon={<Feather name="user" size={20} color={theme.colors.textSecondary} />}
            />
            
            <Input
              label="Age"
              placeholder="Enter child's age"
              value={values.age}
              onChangeText={handleChange('age')}
              onBlur={handleBlur('age')}
              error={errors.age}
              touched={touched.age}
              keyboardType="numeric"
              leftIcon={<Feather name="calendar" size={20} color={theme.colors.textSecondary} />}
            />

            <Text style={styles.note}>
              Your child will use your account to access their chores and rewards. You can create multiple child profiles under your account.
            </Text>
            
            <Button
              title={existingChild ? "Update Profile" : "Create Profile"}
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
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    marginBottom: 8,
  },
  note: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 16,
    marginBottom: 24,
    lineHeight: 20,
  },
  submitButton: {
    marginTop: 16,
  },
});

export default ChildProfileForm;
