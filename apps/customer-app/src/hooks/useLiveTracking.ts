import { useCallback, useEffect, useMemo, useState } from 'react';

import type { LatLng } from '../services/liveTrackingService';
import {
  getDeliveryAgentLocation,
  getOrderTrackingInfo,
  subscribeToDeliveryAgentLocation,
} from '../services/liveTrackingService';

type LiveTrackingState = {
  assignedAgentId: string | null;
  agentLocation: LatLng | null;
  customerLocation: LatLng | null;
  isLoading: boolean;
  errorMessage: string | null;
};

export function useLiveTracking(orderId: string) {
  const [state, setState] = useState<LiveTrackingState>({
    assignedAgentId: null,
    agentLocation: null,
    customerLocation: null,
    isLoading: true,
    errorMessage: null,
  });

  const setPartialState = useCallback((partial: Partial<LiveTrackingState>) => {
    setState((prev) => ({ ...prev, ...partial }));
  }, []);

  const loadOrderTrackingInfo = useCallback(() => {
    return getOrderTrackingInfo(orderId);
  }, [orderId]);

  useEffect(() => {
    let isActive = true;

    (async () => {
      try {
        setPartialState({ isLoading: true, errorMessage: null });
        const trackingInfo = await loadOrderTrackingInfo();
        if (!isActive) return;

        setPartialState({
          assignedAgentId: trackingInfo.assignedDeliveryAgentId,
          customerLocation: trackingInfo.customerLocation,
        });
      } catch (error) {
        if (!isActive) return;
        setPartialState({
          errorMessage:
            error instanceof Error ? error.message : 'Failed to load tracking info',
        });
      } finally {
        if (!isActive) return;
        setPartialState({ isLoading: false });
      }
    })();

    return () => {
      isActive = false;
    };
  }, [loadOrderTrackingInfo, setPartialState]);

  useEffect(() => {
    let isActive = true;
    let unsubscribe: (() => void) | null = null;

    const assignedAgentId = state.assignedAgentId;
    if (!assignedAgentId) {
      return;
    }

    const setAgentLocationSafely = (location: LatLng | null) => {
      if (!isActive) return;
      if (!location) return;
      setPartialState({ agentLocation: location });
    };

    (async () => {
      try {
        const location = await getDeliveryAgentLocation(assignedAgentId);
        if (!isActive) return;
        setAgentLocationSafely(location);

        unsubscribe = subscribeToDeliveryAgentLocation(assignedAgentId, (next) => {
          setAgentLocationSafely(next);
        });

        if (!isActive) {
          unsubscribe();
          unsubscribe = null;
        }
      } catch {
        // Avoid noisy UI errors for transient realtime/fetch issues.
      }
    })();

    return () => {
      isActive = false;
      unsubscribe?.();
    };
  }, [setPartialState, state.assignedAgentId]);

  const mapCenter: LatLng | null = useMemo(() => {
    return state.agentLocation ?? state.customerLocation ?? null;
  }, [state.agentLocation, state.customerLocation]);

  return {
    ...state,
    mapCenter,
  };
}
