import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
  Alert,
} from 'react-native';

import {
  useEffect,
  useState,
  useCallback,
  useMemo,
} from 'react';

import { supabase } from '../lib/supabase';

import {
  getAssignedOrders,
  updateOrderStatus,
} from '../services/orderService';

import {
  getDeliveryAgentByProfileId,
} from '../services/deliveryAgentService';

import OrderStatusBadge from '../components/OrderStatusBadge';
import EmptyState from '../components/EmptyState';
import AssignedOrderCard from '../components/AssignedOrderCard';

import type { DeliveryOrder } from '../types/order';
import { useAgentLocationUpdates } from '../hooks/useAgentLocationUpdates';

export default function DashboardScreen() {
  const [orders, setOrders] =
    useState<DeliveryOrder[]>([]);

  const [deliveryAgentId,
    setDeliveryAgentId] =
    useState<string>('');

  const [isLoading, setIsLoading] =
    useState<boolean>(true);

  const [isRefreshing, setIsRefreshing] =
    useState<boolean>(false);

  const [busyOrderIds, setBusyOrderIds] =
    useState<Record<string, boolean>>({});

  const loadOrders =
    useCallback(async () => {
      if (!deliveryAgentId) return;

      try {
        setIsLoading(true);
        const data =
          await getAssignedOrders(
            deliveryAgentId
          );
        setOrders(data);
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    }, [deliveryAgentId]);

  const subscribeToRealtime =
    useCallback(() => {
      if (!deliveryAgentId) {
        return null;
      }

      const channel =
        supabase.channel(
          'delivery-orders'
        );

      channel
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'orders',
          },
          () => {
            void loadOrders();
          }
        )
        .subscribe();

      return channel;
    }, [deliveryAgentId, loadOrders]);

  useEffect(() => {
    let isActive = true;

    (async () => {
      try {
        const {
          data: { user },
        } =
          await supabase.auth.getUser();

        if (!isActive || !user) {
          return;
        }

        const agent =
          await getDeliveryAgentByProfileId(
            user.id
          );

        if (!isActive) return;
        setDeliveryAgentId(agent.id);
      } catch (error) {
        console.log(error);
      }
    })();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    if (!deliveryAgentId) return;

    void loadOrders();

    const channel =
      subscribeToRealtime();

    return () => {
      if (channel) {
        supabase.removeChannel(
          channel
        );
      }
    };
  }, [deliveryAgentId, loadOrders, subscribeToRealtime]);

  const locationState =
    useAgentLocationUpdates(
      deliveryAgentId || null
    );

  const onRefresh =
    useCallback(async () => {
      if (!deliveryAgentId) return;

      try {
        setIsRefreshing(true);
        await loadOrders();
      } finally {
        setIsRefreshing(false);
      }
    }, [deliveryAgentId, loadOrders]);

  const handleStatusUpdate =
    useCallback(async (
      orderId: string,
      status: 'out_for_delivery' | 'delivered'
    ) => {
      try {
        setBusyOrderIds((prev) => ({
          ...prev,
          [orderId]: true,
        }));

        await updateOrderStatus(
          orderId,
          status
        );

        await loadOrders();
      } catch (error: any) {
        Alert.alert(
          'Error',
          error.message
        );
      } finally {
        setBusyOrderIds((prev) => ({
          ...prev,
          [orderId]: false,
        }));
      }
    }, [loadOrders]);

  const activeOrder =
    useMemo(() => {
      return orders.find(
        (o) =>
          o.status ===
          'out_for_delivery'
      );
    }, [orders]);

  const sortedOrders = useMemo(() => {
    const copy = [...orders];
    copy.sort((a, b) => {
      const aActive = a.status === 'out_for_delivery' ? 1 : 0;
      const bActive = b.status === 'out_for_delivery' ? 1 : 0;
      if (aActive !== bActive) return bActive - aActive;
      return 0;
    });
    return copy;
  }, [orders]);

  const listHeader =
    useMemo(() => {
      const statusText =
        locationState.isEnabled
          ? `Location: on${locationState.lastUpdatedAt ? ` • ${locationState.lastUpdatedAt.toLocaleTimeString()}` : ''}`
          : 'Location: off';

      return (
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            Assigned Orders
          </Text>
          <Text style={styles.headerSub}>
            Realtime updates enabled • {statusText}
          </Text>

          {activeOrder ? (
            <View style={styles.activeBanner}>
              <Text style={styles.activeTitle}>
                Active delivery in progress
              </Text>
              <View style={styles.activeStatusRow}>
                <Text style={styles.activeLabel}>
                  Status:
                </Text>
                <OrderStatusBadge status={activeOrder.status} />
              </View>
            </View>
          ) : null}
        </View>
      );
    }, [activeOrder, locationState.isEnabled, locationState.lastUpdatedAt]);

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
      <FlatList
        data={sortedOrders}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={listHeader}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={orders.length === 0 ? styles.emptyContainer : undefined}
        ListEmptyComponent={
          isLoading ? (
            <EmptyState
              title="Loading assigned orders…"
              description="Hang tight while we sync your queue."
            />
          ) : (
            <EmptyState
              title="No assigned orders"
              description="New deliveries will show up here automatically."
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
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#111827',
  },
  headerSub: {
    marginTop: 4,
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
  },
  activeBanner: {
    marginTop: 12,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FEF3C7',
    backgroundColor: '#FFFBEB',
  },
  activeTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#92400E',
  },
  activeStatusRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  activeLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#92400E',
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
});
