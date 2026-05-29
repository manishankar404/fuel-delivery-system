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

import { signUp } from '../../services/authService';

type Props = NativeStackScreenProps<any>;

export default function SignupScreen({
  navigation,
}: Props) {
  const [email, setEmail] = useState('');

  const [password, setPassword] =
    useState('');

  const [loading, setLoading] =
    useState(false);

  const handleSignup = async () => {
    try {
      setLoading(true);

      await signUp(email, password);

      Alert.alert(
        'Success',
        'Account created successfully'
      );

      navigation.navigate('Login');
    } catch (error: any) {
      Alert.alert(
        'Signup Failed',
        error.message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Create Account
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
            ? 'Creating Account...'
            : 'Sign Up'
        }
        onPress={handleSignup}
      />

      <TouchableOpacity
        onPress={() =>
          navigation.navigate('Login')
        }
      >
        <Text style={styles.link}>
          Already have an account?
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