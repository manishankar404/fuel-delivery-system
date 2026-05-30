import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { useCallback, useMemo } from 'react';

import AssignedOrderCard from '../components/AssignedOrderCard';
import EmptyState from '../components/EmptyState';
import { useDeliveryAgentId } from '../context/DeliveryAgentContext';
import { useRealtimeAssignedOrders } from '../hooks/useRealtimeAssignedOrders';
import type { DeliveryOrder } from '../types/order';

export default function DeliveredOrdersScreen() {
  const deliveryAgentId = useDeliveryAgentId();
  const { orders, isLoading, isRefreshing, refresh } =
    useRealtimeAssignedOrders(deliveryAgentId);

  const deliveredOrders = useMemo(() => {
    return orders.filter((o) => o.status === 'delivered');
  }, [orders]);

  const renderItem = useCallback(
    ({ item }: { item: DeliveryOrder }) => (
      <AssignedOrderCard order={item} isBusy={true} onUpdateStatus={async () => {}} />
    ),
    []
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Delivered</Text>
      <Text style={styles.subHeader}>Completed deliveries</Text>

      <FlatList
        data={deliveredOrders}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={refresh} />}
        contentContainerStyle={deliveredOrders.length === 0 ? styles.emptyContainer : undefined}
        ListEmptyComponent={
          isLoading ? (
            <EmptyState title="Loading delivered orders…" description="Syncing history." />
          ) : (
            <EmptyState title="No delivered orders" description="Completed jobs will show up here." />
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F9FAFB',
  },
  header: {
    fontSize: 22,
    fontWeight: '900',
    color: '#111827',
  },
  subHeader: {
    marginTop: 4,
    marginBottom: 12,
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
});

