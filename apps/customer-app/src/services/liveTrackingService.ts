import type {
  RealtimePostgresUpdatePayload,
} from '@supabase/supabase-js';

import { supabase } from '../lib/supabase';

export type LatLng = {
  latitude: number;
  longitude: number;
};

type OrderTrackingRow = {
  assigned_delivery_agent_id: string | null;
  latitude: number | null;
  longitude: number | null;
};

type DeliveryAgentLocationRow = {
  current_latitude: number | null;
  current_longitude: number | null;
};

export type OrderTrackingInfo = {
  assignedDeliveryAgentId: string | null;
  customerLocation: LatLng | null;
};

export async function getOrderTrackingInfo(
  orderId: string
): Promise<OrderTrackingInfo> {
  const { data, error } = await supabase
    .from('orders')
    .select(
      `
        assigned_delivery_agent_id,
        latitude,
        longitude
      `
    )
    .eq('id', orderId)
    .single<OrderTrackingRow>();

  if (error) {
    throw error;
  }

  const customerLocation =
    typeof data.latitude === 'number' && typeof data.longitude === 'number'
      ? { latitude: data.latitude, longitude: data.longitude }
      : null;

  return {
    assignedDeliveryAgentId: data.assigned_delivery_agent_id ?? null,
    customerLocation,
  };
}

export async function getDeliveryAgentLocation(
  agentId: string
): Promise<LatLng | null> {
  const { data, error } = await supabase
    .from('delivery_agents')
    .select(
      `
        current_latitude,
        current_longitude
      `
    )
    .eq('id', agentId)
    .single<DeliveryAgentLocationRow>();

  if (error) {
    throw error;
  }

  if (
    typeof data.current_latitude !== 'number' ||
    typeof data.current_longitude !== 'number'
  ) {
    return null;
  }

  return {
    latitude: data.current_latitude,
    longitude: data.current_longitude,
  };
}

type DeliveryAgentRealtimeRow = {
  current_latitude?: number | null;
  current_longitude?: number | null;
};

export function subscribeToDeliveryAgentLocation(
  agentId: string,
  onLocation: (location: LatLng) => void
): () => void {
  const channel = supabase.channel(`live-tracking-${agentId}`);

  channel
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'delivery_agents',
        filter: `id=eq.${agentId}`,
      },
      (payload: RealtimePostgresUpdatePayload<DeliveryAgentRealtimeRow>) => {
        const latitude = payload.new?.current_latitude;
        const longitude = payload.new?.current_longitude;

        if (typeof latitude === 'number' && typeof longitude === 'number') {
          onLocation({ latitude, longitude });
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
