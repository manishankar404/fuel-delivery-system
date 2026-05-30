import {
  View,
  Text,
  FlatList,
  Button,
  Alert,
} from 'react-native';

import {
  useEffect,
  useState,
} from 'react';

import { supabase } from '../lib/supabase';

import {
  getAssignedOrders,
  updateOrderStatus,
} from '../services/orderService';

import {
  getDeliveryAgentByProfileId,
} from '../services/deliveryAgentService';

import {
  requestLocationPermission,
  getCurrentLocation,
  updateAgentLocation,
} from '../services/locationService';

import OrderStatusBadge from '../components/OrderStatusBadge';

export default function DashboardScreen() {
  const [orders, setOrders] =
    useState<any[]>([]);

  const [deliveryAgentId,
    setDeliveryAgentId] =
    useState<string>('');

  useEffect(() => {
    loadDeliveryAgent();
  }, []);

  const loadDeliveryAgent =
    async () => {
      try {
        const {
          data: { user },
        } =
          await supabase.auth.getUser();

        if (!user) {
          return;
        }

        const agent =
          await getDeliveryAgentByProfileId(
            user.id
          );

        setDeliveryAgentId(
          agent.id
        );

        loadOrders(agent.id);
        startLiveTracking(agent.id);
        subscribeToRealtime(agent.id);
      } catch (error) {
        console.log(error);
      }
    };

  const loadOrders =
    async (
      agentId: string
    ) => {
      try {
        const data =
          await getAssignedOrders(
            agentId
          );

        setOrders(data);
      } catch (error) {
        console.log(error);
      }
    };
    const subscribeToRealtime =
        (agentId: string) => {
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
          loadOrders(agentId);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(
        channel
      );
    };
  };

  const startLiveTracking =
  async (
    agentId: string
  ) => {
    const granted =
      await requestLocationPermission();

    if (!granted) {
      return;
    }

    const updateLocation =
      async () => {
        try {
          const location =
            await getCurrentLocation();

          await updateAgentLocation(
            agentId,
            location.latitude,
            location.longitude
          );
        } catch (error) {
          console.log(error);
        }
      };

    updateLocation();

    setInterval(
      updateLocation,
      10000
    );
  };

  const handleStatusUpdate =
    async (
      orderId: string,
      status: string
    ) => {
      try {
        await updateOrderStatus(
          orderId,
          status
        );

        Alert.alert(
          'Success',
          `Order marked as ${status}`
        );

        loadOrders(
          deliveryAgentId
        );
      } catch (error: any) {
        Alert.alert(
          'Error',
          error.message
        );
      }
    };

  const renderItem = ({
    item,
  }: any) => (
    <View
      style={{
        borderWidth: 1,
        padding: 16,
        marginBottom: 12,
        borderRadius: 10,
      }}
    >
      <Text
        style={{
          fontSize: 18,
          fontWeight: 'bold',
        }}
      >
        {
          item.fuel_types
            ?.name
        }
      </Text>

      <Text>
        Customer:
        {' '}
        {
          item.profiles
            ?.email
        }
      </Text>

      <Text>
        Quantity:
        {' '}
        {
          item.quantity_liters
        }L
      </Text>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          flexWrap: 'wrap',
          marginTop: 4,
          marginBottom: 4,
        }}
      >
        <Text>Status: </Text>
        <OrderStatusBadge status={item.status} />
      </View>

      <Text>
        Address:
        {' '}
        {
          item.delivery_address
        }
      </Text>

      <View
        style={{
          height: 10,
        }}
      />

      <Button
        title="Out For Delivery"
        onPress={() =>
          handleStatusUpdate(
            item.id,
            'out_for_delivery'
          )
        }
      />

      <View
        style={{
          height: 10,
        }}
      />

      <Button
        title="Delivered"
        onPress={() =>
          handleStatusUpdate(
            item.id,
            'delivered'
          )
        }
      />
    </View>
  );

  return (
    <View
      style={{
        flex: 1,
        padding: 16,
      }}
    >
      <Text
        style={{
          fontSize: 24,
          fontWeight: 'bold',
          marginBottom: 20,
        }}
      >
        Assigned Orders
      </Text>

      <FlatList
        data={orders}
        keyExtractor={(item) =>
          item.id
        }
        renderItem={renderItem}
        ListEmptyComponent={
          <Text>
            No assigned orders
          </Text>
        }
      />
    </View>
  );
}
