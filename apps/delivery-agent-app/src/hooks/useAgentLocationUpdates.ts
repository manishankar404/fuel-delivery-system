import { useEffect, useRef, useState } from 'react';

import {
  getCurrentLocation,
  requestLocationPermission,
  updateAgentLocation,
} from '../services/locationService';

type State = {
  isEnabled: boolean;
  lastUpdatedAt: Date | null;
};

export function useAgentLocationUpdates(deliveryAgentId: string | null) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [state, setState] = useState<State>({
    isEnabled: false,
    lastUpdatedAt: null,
  });

  useEffect(() => {
    let isActive = true;

    const stop = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    if (!deliveryAgentId) {
      stop();
      setState({ isEnabled: false, lastUpdatedAt: null });
      return;
    }

    (async () => {
      try {
        const granted = await requestLocationPermission();
        if (!isActive || !granted) {
          stop();
          if (isActive) {
            setState({ isEnabled: false, lastUpdatedAt: null });
          }
          return;
        }

        const updateOnce = async () => {
          try {
            const location = await getCurrentLocation();
            await updateAgentLocation(
              deliveryAgentId,
              location.latitude,
              location.longitude
            );
            if (!isActive) return;
            setState({ isEnabled: true, lastUpdatedAt: new Date() });
          } catch (error) {
            // Avoid noisy UI failures for transient GPS/network issues.
            if (!isActive) return;
            setState((prev) => ({ ...prev, isEnabled: true }));
          }
        };

        await updateOnce();

        stop();
        intervalRef.current = setInterval(() => {
          void updateOnce();
        }, 10_000);
      } catch {
        stop();
        if (!isActive) return;
        setState({ isEnabled: false, lastUpdatedAt: null });
      }
    })();

    return () => {
      isActive = false;
      stop();
    };
  }, [deliveryAgentId]);

  return state;
}

