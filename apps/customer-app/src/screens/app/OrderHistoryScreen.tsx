import {
  View,
  Text,
  FlatList,
  StyleSheet,
} from 'react-native';

import {
  useEffect,
  useState,
} from 'react';

import { useAuth } from '../../context/AuthContext';

import {
  getCustomerOrders,
} from '../../services/orderService';

import { Order } from '../../types/order';

export default function OrderHistoryScreen() {
  const { profile } = useAuth();

  const [orders, setOrders] =
    useState<Order[]>([]);

  useEffect(() => {
    if (profile?.id) {
      loadOrders();
    }
  }, [profile]);

  const loadOrders =
    async () => {
      try {
        const data =
          await getCustomerOrders(
            profile!.id
          );

        setOrders(data);
      } catch (error) {
        console.log(error);
      }
    };

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

      <Text>
        Address:
        {' '}
        {item.delivery_address}
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