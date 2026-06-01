import { StyleSheet, Text, View } from 'react-native';

import AppButton from '../../components/AppButton';
import BottomTabBar from '../../navigation/BottomTabBar';

import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../../navigation/types';

export default function TrackingHubScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();

  return (
    <View style={styles.root}>
      <View style={styles.container}>
        <Text style={styles.title}>Tracking</Text>
        <Text style={styles.subtitle}>
          Track a delivery by selecting an order in the Orders tab.
        </Text>

        <AppButton title="Go to Orders" onPress={() => navigation.navigate('Orders')} />
      </View>

      <BottomTabBar active="Tracking" />
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
    marginBottom: 16,
  },
});

