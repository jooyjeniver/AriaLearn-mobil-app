import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, ScrollView, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, testApiConnection } from '../services/api';
import { authService } from '../services/authService';

const ApiTest = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState<string>('Checking API connection...');

  useEffect(() => {
    // Check API connection when component mounts
    checkApiConnection();
  }, []);

  const checkApiConnection = async () => {
    try {
      setApiStatus('Checking API connection...');
      const isConnected = await testApiConnection();
      if (isConnected) {
        setApiStatus('API is connected and ready');
      } else {
        setApiStatus('API connection failed. Check server and network settings.');
      }
    } catch (error) {
      setApiStatus(`API connection error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const testLogin = async () => {
    try {
      setLoading(true);
      setResult('Logging in...');
      
      // Use authService instead of direct API call
      const response = await authService.login({ email, password });
      
      if (response.token) {
        Alert.alert('Success', 'Login successful and token saved');
      }
      
      setResult(JSON.stringify(response, null, 2));
    } catch (error: any) {
      setResult(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testRegister = async () => {
    try {
      setLoading(true);
      setResult('Registering...');
      
      // Use authService instead of direct API call
      const response = await authService.register({
        name: 'Test User',
        email,
        password,
        confirmPassword: password
      });
      
      if (response.token) {
        Alert.alert('Success', 'Registration successful and token saved');
      }
      
      setResult(JSON.stringify(response, null, 2));
    } catch (error: any) {
      setResult(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testGetCurrentUser = async () => {
    try {
      setLoading(true);
      setResult('Getting current user...');
      
      const user = await authService.getCurrentUser();
      setResult(JSON.stringify(user, null, 2));
    } catch (error: any) {
      setResult(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.title}>API Test</Text>
        
        <View style={styles.statusContainer}>
          <Text style={styles.statusLabel}>API Status:</Text>
          <Text style={[
            styles.statusValue, 
            apiStatus.includes('ready') ? styles.statusSuccess : styles.statusError
          ]}>
            {apiStatus}
          </Text>
          <Button 
            title="Check Connection" 
            onPress={checkApiConnection} 
            disabled={loading}
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email:</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Enter email"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          
          <Text style={styles.label}>Password:</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Enter password"
            secureTextEntry
          />
        </View>
        
        <View style={styles.buttonContainer}>
          <Button 
            title="Test Login" 
            onPress={testLogin} 
            disabled={loading || !email || !password}
          />
          <View style={styles.buttonSpacer} />
          <Button 
            title="Test Register" 
            onPress={testRegister} 
            disabled={loading || !email || !password}
          />
          <View style={styles.buttonSpacer} />
          <Button 
            title="Get Current User" 
            onPress={testGetCurrentUser} 
            disabled={loading}
          />
        </View>
        
        {loading && (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        )}
        
        {result ? (
          <View style={styles.resultContainer}>
            <Text style={styles.resultTitle}>Result:</Text>
            <Text style={styles.resultText}>{result}</Text>
          </View>
        ) : null}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  statusContainer: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statusValue: {
    fontSize: 14,
    marginBottom: 8,
  },
  statusSuccess: {
    color: 'green',
  },
  statusError: {
    color: 'red',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 8,
    marginBottom: 12,
  },
  buttonContainer: {
    marginBottom: 16,
  },
  buttonSpacer: {
    height: 8,
  },
  loadingContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  resultContainer: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  resultText: {
    fontSize: 14,
  },
});

export default ApiTest; 