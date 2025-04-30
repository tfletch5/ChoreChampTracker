import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Switch } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppState, Reward } from '../../types';
import Input from '../common/Input';
import Button from '../common/Button';
import { theme } from '../../constants/theme';
import { Feather } from '@expo/vector-icons';
import { addReward, updateReward } from '../../store/slices/rewardsSlice';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useStorage } from '../../hooks/useStorage';

interface RewardFormProps {
  existingReward?: Reward;
  onSuccess: () => void;
}

const RewardSchema = Yup.object().shape({
  title: Yup.string()
    .min(2, 'Too Short!')
    .max(50, 'Too Long!')
    .required('Required'),
  description: Yup.string()
    .max(200, 'Too Long!'),
  pointCost: Yup.number()
    .min(1, 'Must be at least 1 point')
    .required('Required'),
  cashValue: Yup.number()
    .when('isCashReward', {
      is: true,
      then: (schema) => schema.min(1, 'Must be at least 1 cent').required('Required'),
      otherwise: (schema) => schema.notRequired(),
    }),
});

const RewardForm: React.FC<RewardFormProps> = ({ existingReward, onSuccess }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: AppState) => state.auth);
  const { uploading, pickAndUploadImage } = useStorage('rewards');
  const [imageUrl, setImageUrl] = useState<string | undefined>(existingReward?.image);

  const initialValues = {
    title: existingReward?.title || '',
    description: existingReward?.description || '',
    pointCost: existingReward?.pointCost?.toString() || '10',
    isCashReward: existingReward?.isCashReward || false,
    cashValue: existingReward?.cashValue ? (existingReward.cashValue / 100).toString() : '',
    isAvailable: existingReward?.isAvailable ?? true,
  };

  const handleImageUpload = async () => {
    try {
      const url = await pickAndUploadImage();
      if (url) {
        setImageUrl(url);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to upload image');
    }
  };

  const handleSubmit = async (values: any) => {
    if (!user?.uid) return;

    try {
      const rewardData: Partial<Reward> = {
        title: values.title,
        description: values.description,
        pointCost: parseInt(values.pointCost, 10),
        isCashReward: values.isCashReward,
        cashValue: values.isCashReward ? Math.round(parseFloat(values.cashValue) * 100) : undefined,
        isAvailable: values.isAvailable,
        image: imageUrl,
        createdBy: user.uid,
      };
      
      if (existingReward) {
        // Update existing reward
        await dispatch(updateReward({
          ...rewardData,
          id: existingReward.id,
        }));
      } else {
        // Add new reward
        await dispatch(addReward(rewardData));
      }
      
      onSuccess();
    } catch (error) {
      Alert.alert('Error', 'Failed to save reward');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Formik
        initialValues={initialValues}
        validationSchema={RewardSchema}
        onSubmit={handleSubmit}
      >
        {({ handleChange, handleBlur, handleSubmit, setFieldValue, values, errors, touched }) => (
          <View style={styles.formContainer}>
            <Input
              label="Reward Title"
              placeholder="Enter reward title"
              value={values.title}
              onChangeText={handleChange('title')}
              onBlur={handleBlur('title')}
              error={errors.title}
              touched={touched.title}
              leftIcon={<Feather name="gift" size={20} color={theme.colors.textSecondary} />}
            />
            
            <Input
              label="Description"
              placeholder="Enter reward description"
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
              label="Point Cost"
              placeholder="Enter point cost"
              value={values.pointCost}
              onChangeText={handleChange('pointCost')}
              onBlur={handleBlur('pointCost')}
              error={errors.pointCost}
              touched={touched.pointCost}
              keyboardType="numeric"
              leftIcon={<Feather name="award" size={20} color={theme.colors.textSecondary} />}
            />
            
            <View style={styles.switchContainer}>
              <Text style={styles.label}>Cash Reward</Text>
              <Switch
                value={values.isCashReward}
                onValueChange={(value) => setFieldValue('isCashReward', value)}
                trackColor={{ false: theme.colors.lightGray, true: theme.colors.primaryLight }}
                thumbColor={values.isCashReward ? theme.colors.primary : '#f4f3f4'}
              />
            </View>
            
            {values.isCashReward && (
              <Input
                label="Cash Value ($)"
                placeholder="Enter cash value"
                value={values.cashValue}
                onChangeText={handleChange('cashValue')}
                onBlur={handleBlur('cashValue')}
                error={errors.cashValue}
                touched={touched.cashValue}
                keyboardType="decimal-pad"
                leftIcon={<Feather name="dollar-sign" size={20} color={theme.colors.textSecondary} />}
              />
            )}
            
            <View style={styles.switchContainer}>
              <Text style={styles.label}>Available for Redemption</Text>
              <Switch
                value={values.isAvailable}
                onValueChange={(value) => setFieldValue('isAvailable', value)}
                trackColor={{ false: theme.colors.lightGray, true: theme.colors.primaryLight }}
                thumbColor={values.isAvailable ? theme.colors.primary : '#f4f3f4'}
              />
            </View>
            
            <View style={styles.imageSection}>
              <Text style={styles.label}>Reward Image (Optional)</Text>
              {imageUrl ? (
                <View style={styles.imagePlaceholder}>
                  <Text style={styles.imagePlaceholderText}>Image uploaded</Text>
                  <Button
                    title="Change Image"
                    onPress={handleImageUpload}
                    type="outline"
                    size="small"
                    loading={uploading}
                  />
                </View>
              ) : (
                <Button
                  title="Upload Image"
                  onPress={handleImageUpload}
                  type="outline"
                  loading={uploading}
                  icon={<Feather name="image" size={20} color={theme.colors.primary} style={{ marginRight: 8 }} />}
                />
              )}
            </View>
            
            <Text style={styles.note}>
              Rewards can be redeemed by children when they earn enough points by completing chores.
              {values.isCashReward && ' Cash rewards will be deducted from your wallet balance.'}
            </Text>
            
            <Button
              title={existingReward ? "Update Reward" : "Create Reward"}
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
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: 6,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 8,
  },
  imageSection: {
    marginTop: 8,
    marginBottom: 16,
  },
  imagePlaceholder: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  imagePlaceholderText: {
    color: theme.colors.textSecondary,
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

export default RewardForm;
