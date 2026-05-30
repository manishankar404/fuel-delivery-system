import { useState } from 'react';

import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
} from 'react-native';

import { signInAgent } from '../services/authService';

export default function LoginScreen() {
  const [email, setEmail] =
    useState('');

  const [password, setPassword] =
    useState('');

  const handleLogin =
    async () => {
      try {
        await signInAgent(
          email,
          password
        );
      } catch (error: any) {
        Alert.alert(
          'Login Failed',
          error.message
        );
      }
    };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <Text
        style={{
          fontSize: 28,
          marginBottom: 24,
        }}
      >
        Delivery Agent Login
      </Text>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={{
          borderWidth: 1,
          marginBottom: 12,
          padding: 12,
        }}
      />

      <TextInput
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={{
          borderWidth: 1,
          marginBottom: 12,
          padding: 12,
        }}
      />

      <Button
        title="Login"
        onPress={handleLogin}
      />
    </View>
  );
}