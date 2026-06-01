import { StyleSheet, Text, View } from 'react-native';

import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import AppButton from '../../components/AppButton';
import { useAuth } from '../../context/AuthContext';
import type { AppStackParamList } from '../../navigation/types';
import BottomTabBar from '../../navigation/BottomTabBar';

export default function HomeScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<AppStackParamList>>();

  const { profile } = useAuth();

  return (
    <View style={styles.root}>
      <View style={styles.container}>
        <Text style={styles.title}>Fuel Delivery</Text>
        <Text style={styles.subtitle}>
          Welcome{profile?.email ? `, ${profile.email}` : ''}.
        </Text>

        <View style={{ height: 14 }} />

        <AppButton title="Create Order" onPress={() => navigation.navigate('CreateOrder')} />
        <View style={{ height: 12 }} />

        <AppButton
          title="Orders"
          onPress={() => navigation.navigate('Orders', { initialTab: 'active' })}
        />
        <View style={{ height: 12 }} />

        <AppButton title="Tracking" onPress={() => navigation.navigate('Tracking')} />
      </View>

      <BottomTabBar active="Home" />
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
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
  },
});

