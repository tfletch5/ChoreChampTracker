import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert
} from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { theme } from '../../constants/theme';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { Feather } from '@expo/vector-icons';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import Constants from 'expo-constants';
import { Formik } from 'formik';
import * as Yup from 'yup';

WebBrowser.maybeCompleteAuthSession();

const SignupSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Name is too short')
    .max(50, 'Name is too long')
    .required('Name is required'),
  email: Yup.string()
    .email('Invalid email')
    .required('Email is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Confirm password is required'),
});

const SignUp = ({ navigation }: any) => {
  const { signUp, signInWithGoogle, loading, error } = useAuth();
  const [googleAuthInProgress, setGoogleAuthInProgress] = useState(false);
  
  // Google Auth
  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: Constants.expoConfig?.extra?.googleExpoClientId,
    androidClientId: Constants.expoConfig?.extra?.googleAndroidClientId,
    iosClientId: Constants.expoConfig?.extra?.googleIosClientId,
    webClientId: Constants.expoConfig?.extra?.googleWebClientId,
  });
  
  useEffect(() => {
    if (response?.type === 'success') {
      setGoogleAuthInProgress(true);
      const { id_token } = response.params;
      handleGoogleSignIn(id_token);
    }
  }, [response]);
  
  useEffect(() => {
    if (error) {
      Alert.alert('Registration Error', error);
    }
  }, [error]);
  
  const handleGoogleSignIn = async (idToken: string) => {
    try {
      await signInWithGoogle(idToken);
    } catch (err) {
      console.error(err);
      Alert.alert('Authentication Error', 'Failed to sign in with Google');
    } finally {
      setGoogleAuthInProgress(false);
    }
  };
  
  const handleEmailSignUp = async (values: { name: string; email: string; password: string }) => {
    try {
      await signUp(values.email, values.password, values.name);
    } catch (err) {
      console.error(err);
    }
  };
  
  const handleSignIn = () => {
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.headerContainer}>
            <View style={styles.logoContainer}>
              <Feather name="check-circle" size={60} color={theme.colors.primary} />
              <Text style={styles.logoText}>ChoreChamp</Text>
            </View>
            <Text style={styles.headerText}>Create Account</Text>
            <Text style={styles.subHeaderText}>Sign up to get started</Text>
          </View>
          
          <View style={styles.formContainer}>
            <Formik
              initialValues={{ name: '', email: '', password: '', confirmPassword: '' }}
              validationSchema={SignupSchema}
              onSubmit={handleEmailSignUp}
            >
              {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                <>
                  <Input
                    label="Full Name"
                    placeholder="Enter your full name"
                    value={values.name}
                    onChangeText={handleChange('name')}
                    onBlur={handleBlur('name')}
                    error={errors.name}
                    touched={touched.name}
                    leftIcon={<Feather name="user" size={20} color={theme.colors.textSecondary} />}
                  />
                  
                  <Input
                    label="Email"
                    placeholder="Enter your email"
                    value={values.email}
                    onChangeText={handleChange('email')}
                    onBlur={handleBlur('email')}
                    error={errors.email}
                    touched={touched.email}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    leftIcon={<Feather name="mail" size={20} color={theme.colors.textSecondary} />}
                  />
                  
                  <Input
                    label="Password"
                    placeholder="Create a password"
                    value={values.password}
                    onChangeText={handleChange('password')}
                    onBlur={handleBlur('password')}
                    error={errors.password}
                    touched={touched.password}
                    secureTextEntry
                    leftIcon={<Feather name="lock" size={20} color={theme.colors.textSecondary} />}
                  />
                  
                  <Input
                    label="Confirm Password"
                    placeholder="Confirm your password"
                    value={values.confirmPassword}
                    onChangeText={handleChange('confirmPassword')}
                    onBlur={handleBlur('confirmPassword')}
                    error={errors.confirmPassword}
                    touched={touched.confirmPassword}
                    secureTextEntry
                    leftIcon={<Feather name="lock" size={20} color={theme.colors.textSecondary} />}
                  />
                  
                  <View style={styles.termsContainer}>
                    <Text style={styles.termsText}>
                      By signing up, you agree to our{' '}
                      <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
                      <Text style={styles.termsLink}>Privacy Policy</Text>
                    </Text>
                  </View>
                  
                  <Button 
                    title="Sign Up" 
                    onPress={handleSubmit}
                    loading={loading && !googleAuthInProgress}
                    fullWidth
                    style={styles.signUpButton}
                  />
                </>
              )}
            </Formik>
            
            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.divider} />
            </View>
            
            <Button 
              title="Sign up with Google" 
              onPress={() => promptAsync()}
              type="outline"
              loading={googleAuthInProgress}
              fullWidth
              icon={
                <View style={styles.googleIcon}>
                  <Feather name="globe" size={20} color={theme.colors.primary} />
                </View>
              }
            />
          </View>
          
          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <TouchableOpacity onPress={handleSignIn}>
              <Text style={styles.signInText}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  headerContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 30,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginTop: 8,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 8,
  },
  subHeaderText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  formContainer: {
    marginBottom: 24,
  },
  termsContainer: {
    marginVertical: 16,
  },
  termsText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  termsLink: {
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  signUpButton: {
    marginBottom: 16,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border,
  },
  dividerText: {
    paddingHorizontal: 16,
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  googleIcon: {
    marginRight: 8,
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 'auto',
    padding: 16,
  },
  footerText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  signInText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginLeft: 5,
  },
});

export default SignUp;
