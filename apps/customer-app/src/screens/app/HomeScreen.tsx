import {
  View,
 Text,
  StyleSheet,
} from 'react-native';

import AppButton from '../../components/AppButton';

import { signOut } from '../../services/authService';

import { useAuth } from '../../context/AuthContext';

export default function HomeScreen() {
  const { profile } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Fuel Delivery App
      </Text>

      <Text style={styles.text}>
        Email: {profile?.email}
      </Text>

      <Text style={styles.text}>
        Role: {profile?.role}
      </Text>

      <AppButton
        title="Logout"
        onPress={signOut}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },

  title: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: 'bold',
  },

  text: {
    marginBottom: 12,
    fontSize: 16,
  },
});