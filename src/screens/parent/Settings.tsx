import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  StatusBar, 
  TouchableOpacity, 
  ScrollView, 
  Switch,
  Alert 
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { signOut } from '../../store/slices/authSlice';
import { AppState } from '../../types';
import { theme } from '../../constants/theme';
import { Feather } from '@expo/vector-icons';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Avatar from '../../components/common/Avatar';
import { cancelAllNotifications } from '../../utils/notifications';
import { initializeStripe } from '../../config/stripe';
import { useAuth } from '../../hooks/useAuth';

const Settings: React.FC<{ navigation: any }> = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: AppState) => state.auth);
  const { signOut: authSignOut } = useAuth();
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkThemeEnabled, setDarkThemeEnabled] = useState(false);
  const [calendarSyncEnabled, setCalendarSyncEnabled] = useState(true);
  const [isPremium, setIsPremium] = useState(user?.isPremium || false);

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleToggleNotifications = (value: boolean) => {
    setNotificationsEnabled(value);
    if (!value) {
      cancelAllNotifications();
    }
  };

  const handleToggleDarkTheme = (value: boolean) => {
    // In a real implementation, this would update app-wide theme
    setDarkThemeEnabled(value);
    Alert.alert('Feature Coming Soon', 'Dark theme will be available in a future update.');
  };

  const handleToggleCalendarSync = (value: boolean) => {
    setCalendarSyncEnabled(value);
  };

  const handleEditProfile = () => {
    Alert.alert('Feature Coming Soon', 'Profile editing will be available in a future update.');
  };

  const handleUpgradeAccount = () => {
    // Initialize Stripe before navigating to subscription page
    initializeStripe().then(() => {
      navigation.navigate('Subscribe');
    });
  };

  const handleShowNotificationSettings = () => {
    Alert.alert('Feature Coming Soon', 'Detailed notification settings will be available in a future update.');
  };

  const handleNavigatePrivacyPolicy = () => {
    Alert.alert('Privacy Policy', 'Our privacy policy details will be available in a future update.');
  };

  const handleNavigateTermsOfService = () => {
    Alert.alert('Terms of Service', 'Our terms of service details will be available in a future update.');
  };

  const handleContactSupport = () => {
    Alert.alert('Contact Support', 'Support contact options will be available in a future update.');
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          onPress: async () => {
            try {
              await authSignOut();
            } catch (error) {
              console.error('Sign out error:', error);
            }
          },
        },
      ]
    );
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
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.placeholder} />
      </View>
      
      <ScrollView style={styles.content}>
        <Card style={styles.profileCard}>
          <View style={styles.profileInfo}>
            <Avatar 
              source={user?.photoURL || undefined} 
              size={80} 
              initials={user?.displayName?.substring(0, 2).toUpperCase() || 'U'}
              borderColor={theme.colors.primary}
              borderWidth={2}
            />
            <View style={styles.profileText}>
              <Text style={styles.profileName}>{user?.displayName || 'User'}</Text>
              <Text style={styles.profileEmail}>{user?.email || 'No email'}</Text>
              <Text style={styles.accountType}>
                {isPremium ? 'Premium Account' : 'Free Account'}
              </Text>
            </View>
          </View>
          
          <View style={styles.profileActions}>
            <Button 
              title="Edit Profile" 
              onPress={handleEditProfile} 
              type="outline"
              size="small"
              icon={<Feather name="edit" size={16} color={theme.colors.primary} style={{ marginRight: 8 }} />}
            />
            {!isPremium && (
              <Button 
                title="Upgrade" 
                onPress={handleUpgradeAccount} 
                type="primary"
                size="small"
                icon={<Feather name="star" size={16} color="#fff" style={{ marginRight: 8 }} />}
                style={styles.upgradeButton}
              />
            )}
          </View>
        </Card>
        
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>App Settings</Text>
        </View>
        
        <Card style={styles.settingsCard}>
          <View style={styles.settingItem}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingLabel}>Notifications</Text>
              <Text style={styles.settingDescription}>Enable push notifications</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={handleToggleNotifications}
              trackColor={{ false: theme.colors.lightGray, true: theme.colors.primaryLight }}
              thumbColor={notificationsEnabled ? theme.colors.primary : '#f4f3f4'}
            />
          </View>
          
          {notificationsEnabled && (
            <TouchableOpacity style={styles.settingSubItem} onPress={handleShowNotificationSettings}>
              <Text style={styles.settingSubLabel}>Notification preferences</Text>
              <Feather name="chevron-right" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          )}
          
          <View style={styles.settingDivider} />
          
          <View style={styles.settingItem}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingLabel}>Dark Theme</Text>
              <Text style={styles.settingDescription}>Switch to dark color scheme</Text>
            </View>
            <Switch
              value={darkThemeEnabled}
              onValueChange={handleToggleDarkTheme}
              trackColor={{ false: theme.colors.lightGray, true: theme.colors.primaryLight }}
              thumbColor={darkThemeEnabled ? theme.colors.primary : '#f4f3f4'}
            />
          </View>
          
          <View style={styles.settingDivider} />
          
          <View style={styles.settingItem}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingLabel}>Calendar Sync</Text>
              <Text style={styles.settingDescription}>Sync chores with device calendar</Text>
            </View>
            <Switch
              value={calendarSyncEnabled}
              onValueChange={handleToggleCalendarSync}
              trackColor={{ false: theme.colors.lightGray, true: theme.colors.primaryLight }}
              thumbColor={calendarSyncEnabled ? theme.colors.primary : '#f4f3f4'}
            />
          </View>
        </Card>
        
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Support & Legal</Text>
        </View>
        
        <Card style={styles.settingsCard}>
          <TouchableOpacity style={styles.settingItem} onPress={handleNavigatePrivacyPolicy}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingLabel}>Privacy Policy</Text>
            </View>
            <Feather name="chevron-right" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
          
          <View style={styles.settingDivider} />
          
          <TouchableOpacity style={styles.settingItem} onPress={handleNavigateTermsOfService}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingLabel}>Terms of Service</Text>
            </View>
            <Feather name="chevron-right" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
          
          <View style={styles.settingDivider} />
          
          <TouchableOpacity style={styles.settingItem} onPress={handleContactSupport}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingLabel}>Contact Support</Text>
            </View>
            <Feather name="chevron-right" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </Card>
        
        <Button 
          title="Sign Out" 
          onPress={handleSignOut}
          type="outline"
          style={styles.signOutButton}
          textStyle={{ color: theme.colors.error }}
          icon={<Feather name="log-out" size={18} color={theme.colors.error} style={{ marginRight: 8 }} />}
        />
        
        <Text style={styles.versionText}>Version 1.0.0</Text>
      </ScrollView>
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
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  profileCard: {
    marginBottom: 20,
    padding: 16,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileText: {
    marginLeft: 16,
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  accountType: {
    fontSize: 14,
    fontWeight: '600',
    color: isPremium => isPremium ? theme.colors.primary : theme.colors.textSecondary,
  },
  profileActions: {
    flexDirection: 'row',
  },
  upgradeButton: {
    marginLeft: 8,
  },
  sectionHeader: {
    marginBottom: 8,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  settingsCard: {
    marginBottom: 20,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    color: theme.colors.text,
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  settingDivider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginHorizontal: 16,
  },
  settingSubItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 32,
    backgroundColor: theme.colors.backgroundSecondary,
  },
  settingSubLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  signOutButton: {
    marginVertical: 20,
    borderColor: theme.colors.error,
  },
  versionText: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
    fontSize: 12,
    marginBottom: 24,
  },
});

export default Settings;
