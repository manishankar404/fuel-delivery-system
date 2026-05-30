import {
  View,
  Text,
  FlatList,
  StyleSheet,
} from 'react-native';

import {
  useEffect,
  useState,
  useCallback,
} from 'react';

import { useAuth } from '../../context/AuthContext';

import {
  getCustomerOrders,
} from '../../services/orderService';

import { Order } from '../../types/order';

import { supabase } from '../../lib/supabase';

import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { AppStackParamList } from '../../navigation/types';

import {
  getOrderHistory,
} from '../../services/historyService';

import OrderTimeline
from '../../components/OrderTimeline';

export default function OrderHistoryScreen() {

  interface HistoryItem {
  id: string;

  status: string;

  created_at: string;
}

const [historyMap,
  setHistoryMap] =
  useState<
    Record<
      string,
      HistoryItem[]
    >
  >({});
  
  const navigation =
    useNavigation<
      NativeStackNavigationProp<AppStackParamList>
    >();

  const { profile } = useAuth();

  const [orders, setOrders] =
    useState<Order[]>([]);

  const loadOrders =
    useCallback(async () => {
      if (!profile?.id) {
        return;
      }

      try {
        const data =
          await getCustomerOrders(
            profile.id
          );

        const ordersData =
          data || [];

        setOrders(
          ordersData
        );

        loadHistories(
          ordersData
        );
      } catch (error) {
        console.log(error);
      }
    }, [profile?.id]);

    const loadHistories =
  async (
    ordersData: Order[]
  ) => {
    try {
      const historyData:
        Record<
          string,
          HistoryItem[]
        > = {};

      for (const order of ordersData) {
        const history =
          await getOrderHistory(
            order.id
          );

        historyData[
          order.id
        ] = history;
      }

      setHistoryMap(
        historyData
      );
    } catch (error) {
      console.log(error);
    }
  };

  const subscribeToRealtime =
    useCallback(() => {
      const channel =
        supabase
          .channel(
            'customer-orders'
          )
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'orders',
            },
            () => {
              loadOrders();
            }
          );

      channel.subscribe();

      return channel;
    }, [loadOrders]);

  useEffect(() => {
    if (!profile?.id) {
      return;
    }

    loadOrders();

    const channel =
      subscribeToRealtime();

    return () => {
      supabase.removeChannel(
        channel
      );
    };
  }, [
    profile?.id,
    loadOrders,
    subscribeToRealtime,
  ]);

  const renderItem = ({
    item,
  }: {
    item: Order;
  }) => (
    <View style={styles.card}>
      <Text style={styles.title}>
        {item.fuel_types?.name}
      </Text>

      <Text>
        Quantity:
        {' '}
        {item.quantity_liters}L
      </Text>

      <Text>
        Total:
        {' '}
        ₹{item.total_price}
      </Text>

      <Text>
        Status:
        {' '}
        {item.status}
      </Text>

      {(
  item.status ===
    'out_for_delivery' ||

  item.status ===
    'delivered'
) && (
  <Text
    style={{
      color: 'blue',
      marginTop: 8,
    }}
    onPress={() =>
      navigation.navigate(
        'LiveTracking',
        {
          orderId: item.id,
        }
      )
    }
  >
    Track Delivery
  </Text>
)}

      <OrderTimeline
          history={
            historyMap[
              item.id
            ] || []
          }
        />

      <Text>
        Address:
        {' '}
        {item.delivery_address}
      </Text>

      <Text>
        Location:
        {' '}
        {item.latitude},
        {' '}
        {item.longitude}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>
        My Orders
      </Text>

      <FlatList
        data={orders}
        keyExtractor={(item) =>
          item.id
        }
        renderItem={renderItem}
        ListEmptyComponent={
          <Text>
            No orders found
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },

  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },

  card: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    marginBottom: 12,
  },

  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
});
