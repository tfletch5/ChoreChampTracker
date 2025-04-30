import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { signIn } from '../../src/store/slices/authSlice';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const router = useRouter();
  const dispatch = useDispatch();
  const { loading, error, user } = useSelector((state) => state.auth);

  // Check if user is already logged in
  useEffect(() => {
    if (user) {
      router.replace('/tabs');
    }
  }, [user]);

  const handleLogin = async () => {
    if (!email || !password) {
      setLocalError('Please enter both email and password.');
      return;
    }

    setLocalError('');
    
    // For development/testing purposes
    if (email === 'demo@parent.com' && password === 'password') {
      // Simulated parent login - update with Redux action later
      router.replace('/tabs');
      return;
    }
    if (email === 'demo@child.com' && password === 'password') {
      // Simulated child login - update with Redux action later
      router.replace('/tabs');
      return;
    }
    
    // Use the signIn action from our Redux store
    dispatch(signIn({ email, password }));
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Text style={styles.logoText}>ChoreChamp</Text>
        <Text style={styles.tagline}>Making chores fun for families</Text>
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        {localError ? <Text style={styles.errorText}>{localError}</Text> : null}

        <TouchableOpacity 
          style={styles.loginButton} 
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.loginButtonText}>Log In</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.demoButton} 
          onPress={() => {
            setEmail('demo@parent.com');
            setPassword('password');
          }}
        >
          <Text style={styles.demoButtonText}>Use Demo Parent Account</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.demoButton} 
          onPress={() => {
            setEmail('demo@child.com');
            setPassword('password');
          }}
        >
          <Text style={styles.demoButtonText}>Use Demo Child Account</Text>
        </TouchableOpacity>

        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/auth/signup')}>
            <Text style={styles.signupLink}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 80,
    marginBottom: 60,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4E67F0',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: '#666',
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: '#FAFAFA',
  },
  errorText: {
    color: '#FF3B30',
    marginBottom: 15,
  },
  loginButton: {
    backgroundColor: '#4E67F0',
    borderRadius: 8,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  demoButton: {
    borderColor: '#4E67F0',
    borderWidth: 1,
    borderRadius: 8,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  demoButtonText: {
    color: '#4E67F0',
    fontSize: 14,
    fontWeight: '500',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  signupText: {
    color: '#666',
  },
  signupLink: {
    color: '#4E67F0',
    fontWeight: '600',
  },
});