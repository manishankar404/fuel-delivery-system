import { useMemo } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

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
  const route = useRoute<RouteProp<AppStackParamList, 'LiveTracking'>>();
  const { orderId } = route.params;

  const {
    assignedAgentId,
    agentLocation,
    customerLocation,
    mapCenter,
    isLoading,
  } = useLiveTracking(orderId);

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
      <View style={styles.header}>
        <Text style={styles.title}>Live Delivery Tracking</Text>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryText}>
            Distance: {distanceKm === null ? '—' : `${distanceKm.toFixed(2)} km`}
          </Text>
          <Text style={styles.summaryText}>
            ETA: {etaMins === null ? '—' : `${etaMins} mins`}
          </Text>
        </View>

        {isLoading ? (
          <View style={styles.statusRow}>
            <ActivityIndicator size="small" />
            <Text style={styles.statusTextInline}>Loading tracking…</Text>
          </View>
        ) : assignedAgentId ? (
          <Text style={styles.statusText}>
            {agentLocation ? 'Agent is on the move.' : 'Waiting for agent location…'}
          </Text>
        ) : (
          <Text style={styles.statusText}>
            Waiting for dispatch to assign a delivery agent.
          </Text>
        )}
      </View>

      <MapView
        style={styles.map}
        region={{
          latitude: center.latitude,
          longitude: center.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        {customerLocation && (
          <Marker
            coordinate={customerLocation}
            title="Delivery Location"
            pinColor="#111827"
          />
        )}
        {agentLocation && (
          <Marker
            coordinate={agentLocation}
            title="Delivery Agent"
            pinColor="#F97316"
          />
        )}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },

  header: {
    padding: 16,
    paddingBottom: 10,
  },

  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
  },

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 10,
  },

  summaryText: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '700',
  },

  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
  },

  statusTextInline: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
  },

  statusText: {
    marginTop: 10,
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
  },

  map: {
    flex: 1,
  },
});

