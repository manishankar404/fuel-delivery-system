import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import EmptyState from '../../components/EmptyState';
import OrderCard from '../../components/OrderCard';
import OrderLifecycleProgress from '../../components/OrderLifecycleProgress';
import OrderTimeline from '../../components/OrderTimeline';
import { useAuth } from '../../context/AuthContext';
import type { AppStackParamList } from '../../navigation/types';
import { supabase } from '../../lib/supabase';
import { getOrderHistory } from '../../services/historyService';
import { getCustomerOrders } from '../../services/orderService';
import type { Order } from '../../types/order';

type HistoryItem = {
  id: string;
  status: string;
  created_at: string;
};

type TabKey = 'active' | 'delivered';

export default function OrderHistoryScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<AppStackParamList>>();

  const route = useRoute<RouteProp<AppStackParamList, 'OrderHistory'>>();

  const { profile } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [historyMap, setHistoryMap] = useState<Record<string, HistoryItem[]>>(
    {}
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const initialTabFromRoute: TabKey =
    route.params?.initialTab === 'delivered' ? 'delivered' : 'active';

  const [tab, setTab] = useState<TabKey>(initialTabFromRoute);
  const [highlightOrderId, setHighlightOrderId] = useState<string | null>(
    route.params?.highlightOrderId ?? null
  );

  useEffect(() => {
    if (route.params?.initialTab) {
      setTab(route.params.initialTab);
    }
    if (route.params?.highlightOrderId) {
      setHighlightOrderId(route.params.highlightOrderId);
    }
  }, [route.params?.highlightOrderId, route.params?.initialTab]);

  const loadHistories = useCallback(async (ordersData: Order[]) => {
    try {
      const historyData: Record<string, HistoryItem[]> = {};

      for (const order of ordersData) {
        const history = await getOrderHistory(order.id);
        historyData[order.id] = history;
      }

      setHistoryMap(historyData);
    } catch (error) {
      console.log(error);
    }
  }, []);

  const loadOrders = useCallback(async () => {
    if (!profile?.id) {
      return;
    }

    try {
      setIsLoading(true);
      const data = await getCustomerOrders(profile.id);
      const ordersData = data || [];

      setOrders(ordersData);
      await loadHistories(ordersData);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }, [loadHistories, profile?.id]);

  const subscribeToRealtime = useCallback(() => {
    const channel = supabase.channel('customer-orders').on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'orders',
      },
      () => {
        void loadOrders();
      }
    );

    channel.subscribe();
    return channel;
  }, [loadOrders]);

  useEffect(() => {
    if (!profile?.id) {
      return;
    }

    void loadOrders();

    const channel = subscribeToRealtime();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id, loadOrders, subscribeToRealtime]);

  const onRefresh = useCallback(async () => {
    if (!profile?.id) return;

    try {
      setIsRefreshing(true);
      await loadOrders();
    } finally {
      setIsRefreshing(false);
    }
  }, [loadOrders, profile?.id]);

  const filteredOrders = useMemo(() => {
    if (tab === 'delivered') {
      return orders.filter((o) => o.status === 'delivered');
    }
    return orders.filter((o) => o.status !== 'delivered');
  }, [orders, tab]);

  const listEmpty = useMemo(() => {
    if (isLoading) {
      return (
        <EmptyState
          title="Loading orders…"
          description="Hang tight while we fetch your latest orders."
        />
      );
    }

    return tab === 'delivered' ? (
      <EmptyState title="No delivered orders" description="Completed deliveries will appear here." />
    ) : (
      <EmptyState
        title="No active orders"
        description="Create your first fuel order and track it here."
      />
    );
  }, [isLoading, tab]);

  const openTracking = useCallback(
    (orderId: string) => {
      navigation.navigate('LiveTracking', { orderId });
    },
    [navigation]
  );

  const renderItem = useCallback(
    ({ item }: { item: Order }) => {
      const canTrack =
        item.status === 'assigned' ||
        item.status === 'out_for_delivery' ||
        item.status === 'delivered';

      const primaryMeta = `${item.quantity_liters} L • ₹${item.total_price}`;
      const secondaryMeta = item.delivery_address ? `Deliver to: ${item.delivery_address}` : undefined;

      return (
        <OrderCard
          title={item.fuel_types?.name ?? 'Fuel Order'}
          status={item.status}
          primaryMeta={primaryMeta}
          secondaryMeta={secondaryMeta}
          footerLeft={
            <View>
              <OrderLifecycleProgress status={item.status} />
              <OrderTimeline history={historyMap[item.id] || []} />
            </View>
          }
          footerRight={
            canTrack ? (
              <TouchableOpacity style={styles.trackButton} onPress={() => openTracking(item.id)}>
                <Text style={styles.trackButtonText}>Track</Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.trackHint}>Waiting for dispatch…</Text>
            )
          }
          onPress={canTrack ? () => openTracking(item.id) : undefined}
        />
      );
    },
    [historyMap, openTracking]
  );

  const listRef = useRef<FlatList<Order>>(null);

  useEffect(() => {
    if (!highlightOrderId) return;
    if (isLoading) return;

    const index = filteredOrders.findIndex((o) => o.id === highlightOrderId);
    if (index < 0) return;

    setTimeout(() => {
      try {
        listRef.current?.scrollToIndex({ index, animated: true });
        setHighlightOrderId(null);
      } catch {
        // ignore
      }
    }, 250);
  }, [filteredOrders, highlightOrderId, isLoading]);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>My Orders</Text>
        <Text style={styles.headerSub}>Realtime updates enabled</Text>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, tab === 'active' && styles.tabActive]}
          onPress={() => setTab('active')}
        >
          <Text style={[styles.tabText, tab === 'active' && styles.tabTextActive]}>Active</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'delivered' && styles.tabActive]}
          onPress={() => setTab('delivered')}
        >
          <Text style={[styles.tabText, tab === 'delivered' && styles.tabTextActive]}>
            Delivered
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        ref={listRef}
        data={filteredOrders}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
        contentContainerStyle={filteredOrders.length === 0 ? styles.emptyContainer : undefined}
        ListEmptyComponent={listEmpty}
        onScrollToIndexFailed={() => {
          // fallback: do nothing
        }}
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
  headerRow: {
    marginBottom: 12,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerSub: {
    marginTop: 4,
    fontSize: 13,
    color: '#6B7280',
  },
  tabs: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  tab: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  tabActive: {
    borderColor: '#111827',
    backgroundColor: '#111827',
  },
  tabText: {
    fontWeight: '800',
    color: '#111827',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  trackButton: {
    backgroundColor: '#111827',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  trackButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  trackHint: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
});

