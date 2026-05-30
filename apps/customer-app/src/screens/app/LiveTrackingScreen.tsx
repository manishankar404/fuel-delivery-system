import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import MapView, { Marker } from 'react-native-maps';

import type { AppStackParamList } from '../../navigation/types';
import {
  calculateDistance,
  estimateDeliveryTime,
} from '../../services/distanceService';
import { useLiveTracking } from '../../hooks/useLiveTracking';

const DEFAULT_CENTER = {
  latitude: 11.6643,
  longitude: 78.146,
};

export default function LiveTrackingScreen() {
  const route =
    useRoute<RouteProp<AppStackParamList, 'LiveTracking'>>();

  const { orderId } = route.params;

  const { agentLocation, customerLocation, mapCenter } =
    useLiveTracking(orderId);

  const distanceKm = useMemo(() => {
    if (!agentLocation || !customerLocation) {
      return null;
    }

    return calculateDistance(
      customerLocation.latitude,
      customerLocation.longitude,
      agentLocation.latitude,
      agentLocation.longitude
    );
  }, [agentLocation, customerLocation]);

  const etaMins = useMemo(() => {
    if (distanceKm === null) {
      return null;
    }

    return estimateDeliveryTime(distanceKm);
  }, [distanceKm]);

  const center = mapCenter ?? DEFAULT_CENTER;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Live Delivery Tracking</Text>

      <Text style={styles.info}>
        Distance: {distanceKm === null ? '—' : `${distanceKm.toFixed(2)} km`}
      </Text>

      <Text style={styles.info}>ETA: {etaMins === null ? '—' : `${etaMins} mins`}</Text>

      <MapView
        style={styles.map}
        region={{
          latitude: center.latitude,
          longitude: center.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        {agentLocation && (
          <Marker coordinate={agentLocation} title="Delivery Agent" />
        )}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
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
