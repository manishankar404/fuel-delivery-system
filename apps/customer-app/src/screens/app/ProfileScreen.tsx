import { StyleSheet, Text, View } from 'react-native';

import AppButton from '../../components/AppButton';
import { useAuth } from '../../context/AuthContext';
import { signOut } from '../../services/authService';
import BottomTabBar from '../../navigation/BottomTabBar';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../../navigation/types';

export default function ProfileScreen() {
  const { profile } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();

  return (
    <View style={styles.root}>
      <View style={styles.container}>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.row}>Email: {profile?.email}</Text>
        <Text style={styles.row}>Role: {profile?.role}</Text>

        <View style={{ height: 12 }} />
        <AppButton title="Wallet" onPress={() => navigation.navigate('Wallet')} />

        <View style={{ height: 12 }} />
        <AppButton title="Logout" onPress={signOut} />
      </View>

      <BottomTabBar active="Profile" />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 10,
  },
  row: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '600',
    marginBottom: 8,
  },
});
