import { useState } from 'react';

import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';

import AppButton from '../components/AppButton';
import { signInAgent } from '../services/authService';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);
      await signInAgent(email, password);
    } catch (error: unknown) {
      Alert.alert('Login Failed', error instanceof Error ? error.message : 'Unable to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Delivery Agent</Text>
      <Text style={styles.subtitle}>Sign in to see your assigned orders.</Text>

      <Text style={styles.label}>Email</Text>
      <TextInput
        placeholder="name@company.com"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
      />

      <Text style={styles.label}>Password</Text>
      <TextInput
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={styles.input}
      />

      <AppButton title={loading ? 'Signing in…' : 'Login'} onPress={handleLogin} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#F9FAFB',
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
    marginBottom: 20,
  },
  label: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '800',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
  },
});

