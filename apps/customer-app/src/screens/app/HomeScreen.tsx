import {
  View,
  Text,
  StyleSheet,
} from 'react-native';

import { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { AppStackParamList } from '../../navigation/types';

import AppButton from '../../components/AppButton';

import { signOut } from '../../services/authService';

import { useAuth } from '../../context/AuthContext';

type Props =
  NativeStackScreenProps<AppStackParamList, 'Home'>;

export default function HomeScreen({
  navigation,
}: Props) {
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
        title="Create Order"
        onPress={() =>
          navigation.navigate(
            'CreateOrder'
          )
        }
      />
      <View
        style={{
          height: 12,
        }}
      />

      <AppButton
        title="My Orders"
        onPress={() =>
          navigation.navigate(
            'OrderHistory',
            { initialTab: 'active' }
          )
        }
      />

      <View
        style={{
          height: 12,
        }}
      />

      <AppButton
        title="Delivered Orders"
        onPress={() =>
          navigation.navigate(
            'OrderHistory',
            { initialTab: 'delivered' }
          )
        }
      />

      <View style={{ height: 12 }} />

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
