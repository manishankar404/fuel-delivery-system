import * as Location
from 'expo-location';

import { supabase }
from '../lib/supabase';

export const requestLocationPermission =
  async () => {
    const {
      status,
    } =
      await Location
        .requestForegroundPermissionsAsync();

    return status === 'granted';
  };

export const getCurrentLocation =
  async () => {
    const location =
      await Location
        .getCurrentPositionAsync(
          {}
        );

    return {
      latitude:
        location.coords.latitude,

      longitude:
        location.coords.longitude,
    };
  };

export const updateAgentLocation =
  async (
    deliveryAgentId: string,
    latitude: number,
    longitude: number
  ) => {
    const { error } =
      await supabase
        .from('delivery_agents')
        .update({
          current_latitude:
            latitude,

          current_longitude:
            longitude,

          last_location_update:
            new Date()
              .toISOString(),
        })
        .eq(
          'id',
          deliveryAgentId
        );

    if (error) {
      throw error;
    }
  };