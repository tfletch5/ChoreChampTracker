import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  ImageBackground, 
  Image,
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

const LoginSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string().required('Password is required'),
});

const Login = ({ navigation }: any) => {
  const { signIn, signInWithGoogle, loading, error } = useAuth();
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
      Alert.alert('Authentication Error', error);
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
  
  const handleEmailSignIn = async (values: { email: string; password: string }) => {
    try {
      await signIn(values.email, values.password);
    } catch (err) {
      console.error(err);
    }
  };
  
  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };
  
  const handleSignUp = () => {
    navigation.navigate('SignUp');
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
            <Text style={styles.headerText}>Welcome Back!</Text>
            <Text style={styles.subHeaderText}>Sign in to continue</Text>
          </View>
          
          <View style={styles.formContainer}>
            <Formik
              initialValues={{ email: '', password: '' }}
              validationSchema={LoginSchema}
              onSubmit={handleEmailSignIn}
            >
              {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                <>
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
                    placeholder="Enter your password"
                    value={values.password}
                    onChangeText={handleChange('password')}
                    onBlur={handleBlur('password')}
                    error={errors.password}
                    touched={touched.password}
                    secureTextEntry
                    leftIcon={<Feather name="lock" size={20} color={theme.colors.textSecondary} />}
                  />
                  
                  <TouchableOpacity 
                    style={styles.forgotPasswordContainer} 
                    onPress={handleForgotPassword}
                  >
                    <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                  </TouchableOpacity>
                  
                  <Button 
                    title="Sign In" 
                    onPress={handleSubmit}
                    loading={loading && !googleAuthInProgress}
                    fullWidth
                    style={styles.signInButton}
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
              title="Sign in with Google" 
              onPress={() => promptAsync()}
              type="outline"
              loading={googleAuthInProgress}
              fullWidth
              icon={
                <Image 
                  source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg' }} 
                  style={styles.googleIcon} 
                />
              }
            />
          </View>
          
          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>Don't have an account?</Text>
            <TouchableOpacity onPress={handleSignUp}>
              <Text style={styles.signUpText}>Sign Up</Text>
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
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: 16,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: theme.colors.primary,
  },
  signInButton: {
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
    width: 20,
    height: 20,
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
  signUpText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginLeft: 5,
  },
});

export default Login;
