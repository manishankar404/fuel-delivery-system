import { useState } from 'react';

import {
  View,
  Text,
  Alert,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

import { NativeStackScreenProps } from '@react-navigation/native-stack';

import AppInput from '../../components/AppInput';
import AppButton from '../../components/AppButton';

import { signIn } from '../../services/authService';

type Props = NativeStackScreenProps<any>;

export default function LoginScreen({
  navigation,
}: Props) {
  const [email, setEmail] = useState('');

  const [password, setPassword] =
    useState('');

  const [loading, setLoading] =
    useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);

      await signIn(email, password);
    } catch (error: any) {
      Alert.alert(
        'Login Failed',
        error.message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Login
      </Text>

      <AppInput
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
      />

      <AppInput
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        secureTextEntry
      />

      <AppButton
        title={
          loading
            ? 'Logging In...'
            : 'Login'
        }
        onPress={handleLogin}
      />

      <TouchableOpacity
        onPress={() =>
          navigation.navigate('Signup')
        }
      >
        <Text style={styles.link}>
          Create new account
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
  },

  link: {
    marginTop: 16,
    textAlign: 'center',
    color: '#007AFF',
  },
});