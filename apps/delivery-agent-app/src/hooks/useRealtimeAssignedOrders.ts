import { useCallback, useEffect, useMemo, useState } from 'react';

import { supabase } from '../lib/supabase';
import { getAssignedOrders } from '../services/orderService';
import type { DeliveryOrder } from '../types/order';

type State = {
  orders: DeliveryOrder[];
  isLoading: boolean;
  isRefreshing: boolean;
};

export function useRealtimeAssignedOrders(deliveryAgentId: string | null) {
  const [state, setState] = useState<State>({
    orders: [],
    isLoading: true,
    isRefreshing: false,
  });

  const load = useCallback(async () => {
    if (!deliveryAgentId) return;

    try {
      setState((prev) => ({ ...prev, isLoading: true }));
      const data = await getAssignedOrders(deliveryAgentId);
      setState((prev) => ({ ...prev, orders: data }));
    } finally {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, [deliveryAgentId]);

  const refresh = useCallback(async () => {
    if (!deliveryAgentId) return;

    try {
      setState((prev) => ({ ...prev, isRefreshing: true }));
      const data = await getAssignedOrders(deliveryAgentId);
      setState((prev) => ({ ...prev, orders: data }));
    } finally {
      setState((prev) => ({ ...prev, isRefreshing: false }));
    }
  }, [deliveryAgentId]);

  useEffect(() => {
    if (!deliveryAgentId) return;

    void load();

    const channel = supabase
      .channel(
        `delivery-orders-${deliveryAgentId}-${Date.now()}`
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
        },
        () => {
          void load();
        }
      );

    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [deliveryAgentId, load]);

  const sortedOrders = useMemo(() => {
    const copy = [...state.orders];
    copy.sort((a, b) => {
      const aActive = a.status === 'out_for_delivery' ? 1 : 0;
      const bActive = b.status === 'out_for_delivery' ? 1 : 0;
      if (aActive !== bActive) return bActive - aActive;
      return 0;
    });
    return copy;
  }, [state.orders]);

  return {
    orders: sortedOrders,
    isLoading: state.isLoading,
    isRefreshing: state.isRefreshing,
    refresh,
    reload: load,
  };
}

