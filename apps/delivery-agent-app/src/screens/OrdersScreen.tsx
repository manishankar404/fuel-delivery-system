import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { useCallback, useMemo, useState } from 'react';

import AssignedOrderCard from '../components/AssignedOrderCard';
import EmptyState from '../components/EmptyState';
import { useDeliveryAgentId } from '../context/DeliveryAgentContext';
import { useRealtimeAssignedOrders } from '../hooks/useRealtimeAssignedOrders';
import { updateOrderStatus } from '../services/orderService';
import type { DeliveryOrder } from '../types/order';

export default function OrdersScreen() {
  const deliveryAgentId = useDeliveryAgentId();
  const { orders, isLoading, isRefreshing, refresh, reload } =
    useRealtimeAssignedOrders(deliveryAgentId);

  const [busyOrderIds, setBusyOrderIds] = useState<Record<string, boolean>>({});

  const activeOrders = useMemo(() => {
    return orders.filter((o) => o.status !== 'delivered');
  }, [orders]);

  const handleStatusUpdate = useCallback(
    async (orderId: string, status: 'out_for_delivery' | 'delivered') => {
      try {
        setBusyOrderIds((prev) => ({ ...prev, [orderId]: true }));
        await updateOrderStatus(orderId, status);
        await reload();
      } finally {
        setBusyOrderIds((prev) => ({ ...prev, [orderId]: false }));
      }
    },
    [reload]
  );

  const renderItem = useCallback(
    ({ item }: { item: DeliveryOrder }) => (
      <AssignedOrderCard
        order={item}
        isBusy={Boolean(busyOrderIds[item.id])}
        isActive={item.status === 'out_for_delivery'}
        onUpdateStatus={handleStatusUpdate}
      />
    ),
    [busyOrderIds, handleStatusUpdate]
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Orders</Text>
      <Text style={styles.subHeader}>Assigned queue • Realtime updates enabled</Text>

      <FlatList
        data={activeOrders}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={refresh} />}
        contentContainerStyle={activeOrders.length === 0 ? styles.emptyContainer : undefined}
        ListEmptyComponent={
          isLoading ? (
            <EmptyState title="Loading assigned orders…" description="Syncing your queue." />
          ) : (
            <EmptyState
              title="No active orders"
              description="New deliveries will appear here automatically."
            />
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

