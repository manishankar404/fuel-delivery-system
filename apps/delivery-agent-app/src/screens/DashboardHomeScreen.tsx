import { StyleSheet, Text, View } from 'react-native';

import AppButton from '../components/AppButton';
import EmptyState from '../components/EmptyState';
import { useDeliveryAgentId } from '../context/DeliveryAgentContext';
import { useAgentLocationUpdates } from '../hooks/useAgentLocationUpdates';
import { useRealtimeAssignedOrders } from '../hooks/useRealtimeAssignedOrders';

import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AgentAppStackParamList } from '../navigation/types';

export default function DashboardHomeScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<AgentAppStackParamList>>();

  const deliveryAgentId = useDeliveryAgentId();
  const { orders, isLoading } = useRealtimeAssignedOrders(deliveryAgentId);
  const locationState = useAgentLocationUpdates(deliveryAgentId);

  const activeCount = orders.filter((o) => o.status !== 'delivered').length;
  const deliveredCount = orders.filter((o) => o.status === 'delivered').length;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Field Dashboard</Text>
      <Text style={styles.subtitle}>
        Location updates: {locationState.isEnabled ? 'On' : 'Off'}
      </Text>

      <View style={styles.metricsRow}>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Active</Text>
          <Text style={styles.metricValue}>{activeCount}</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Delivered</Text>
          <Text style={styles.metricValue}>{deliveredCount}</Text>
        </View>
      </View>

      <AppButton title="Go to Orders" onPress={() => navigation.navigate('Orders')} />
      <View style={{ height: 10 }} />
      <AppButton
        title="View Delivered Orders"
        onPress={() => navigation.navigate('Delivered')}
      />

      {isLoading && orders.length === 0 ? (
        <EmptyState title="Syncing…" description="Pulling your latest assigned jobs." />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F9FAFB',
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
    marginBottom: 14,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    padding: 14,
  },
  metricLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '800',
  },
  metricValue: {
    marginTop: 6,
    fontSize: 22,
    color: '#111827',
    fontWeight: '900',
  },
});

