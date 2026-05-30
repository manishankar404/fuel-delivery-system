import {
  View,
  Text,
  StyleSheet,
} from 'react-native';

import {
  useEffect,
  useState,
  useCallback,
} from 'react';

import MapView, {
  Marker,
} from 'react-native-maps';

import { supabase }
from '../../lib/supabase';

import {
  useRoute,
} from '@react-navigation/native';

interface RouteParams {
  orderId: string;
}

import {
  calculateDistance,
  estimateDeliveryTime,
} from '../../services/distanceService';

export default function LiveTrackingScreen() {

  const route =
    useRoute<any>();

  const { orderId } =
    route.params as RouteParams;

  const [
    assignedAgentId,
    setAssignedAgentId,
  ] = useState<
    string | null
  >(null);

  const [agentLocation,
    setAgentLocation] =
    useState({
      latitude: 11.6643,
      longitude: 78.1460,
    });

  const [
    customerLocation,
    setCustomerLocation,
  ] = useState({
    latitude: 0,
    longitude: 0,
  });

  const loadAssignedAgent =
    useCallback(async () => {
      try {
        const {
          data,
          error,
        } =
          await supabase
            .from('orders')
            .select(`
              assigned_delivery_agent_id,
              latitude,
              longitude
            `)
            .eq(
              'id',
              orderId
            )
            .single();

        if (error) {
          console.log(error);
          return;
        }

        if (
          data
            ?.assigned_delivery_agent_id
        ) {
          setAssignedAgentId(
            data.assigned_delivery_agent_id
          );
          if (
            data.latitude &&
            data.longitude
          ) {
            setCustomerLocation({
              latitude:
                data.latitude,

              longitude:
                data.longitude,
            });
          }
        }
      } catch (error) {
        console.log(error);
      }
    }, [orderId]);

  const subscribeToTracking =
    useCallback(() => {

      if (!assignedAgentId) {
        return;
      }

      const loadLocation =
        async () => {
          try {
            const {
              data,
              error,
            } =
              await supabase
                .from(
                  'delivery_agents'
                )
                .select(
                  `
                  current_latitude,
                  current_longitude
                  `
                )
                .eq(
                  'id',
                  assignedAgentId
                )
                .single();

            if (error) {
              console.log(error);
              return;
            }

            if (
              data
                ?.current_latitude &&
              data
                ?.current_longitude
            ) {
              setAgentLocation({
                latitude:
                  data.current_latitude,

                longitude:
                  data.current_longitude,
              });
            }
          } catch (error) {
            console.log(error);
          }
        };

      loadLocation();

      const channel =
        supabase.channel(
          `live-tracking-${assignedAgentId}`
        );

      channel
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table:
              'delivery_agents',
            filter:
              `id=eq.${assignedAgentId}`,
          },
          () => {
            loadLocation();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(
          channel
        );
      };
    }, [assignedAgentId]);

  useEffect(() => {
    loadAssignedAgent();
  }, [loadAssignedAgent]);

  useEffect(() => {

    if (!assignedAgentId) {
      return;
    }

    const cleanup =
      subscribeToTracking();

    return () => {
      if (cleanup) {
        cleanup();
      }
    };

  }, [
    assignedAgentId,
    subscribeToTracking,
  ]);

  const distance =
    calculateDistance(
      customerLocation.latitude,
      customerLocation.longitude,

      agentLocation.latitude,
      agentLocation.longitude
    );

    const eta =
      estimateDeliveryTime(
        distance
      );    

  return (
    <View style={styles.container}>

      <Text style={styles.title}>
        Live Delivery Tracking
      </Text>

      <Text style={styles.info}>
        Distance:
        {' '}
        {distance.toFixed(2)}
        km
      </Text>

      <Text style={styles.info}>
        ETA:
        {' '}
        {eta}
        mins
      </Text>

      <MapView
        style={styles.map}
        region={{
          latitude:
            agentLocation.latitude,

          longitude:
            agentLocation.longitude,

          latitudeDelta:
            0.01,

          longitudeDelta:
            0.01,
        }}
      >
        <Marker
          coordinate={
            agentLocation
          }
          title="Delivery Agent"
        />
      </MapView>

    </View>
  );
}

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
    },

    info: {
      fontSize: 16,
      paddingHorizontal: 16,
      paddingBottom: 8,
    },

    title: {
      fontSize: 22,
      fontWeight: 'bold',
      padding: 16,
    },

    map: {
      flex: 1,
    },
  });
