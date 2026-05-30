import { useEffect, useState } from 'react';

import { supabase } from '../lib/supabase';
import { getDeliveryAgentByProfileId } from '../services/deliveryAgentService';

type State = {
  deliveryAgentId: string | null;
  isLoading: boolean;
  errorMessage: string | null;
};

export function useDeliveryAgentIdentity(): State {
  const [state, setState] = useState<State>({
    deliveryAgentId: null,
    isLoading: true,
    errorMessage: null,
  });

  useEffect(() => {
    let isActive = true;

    (async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!isActive) return;
        if (!user) {
          setState({
            deliveryAgentId: null,
            isLoading: false,
            errorMessage: 'Not signed in',
          });
          return;
        }

        const agent = await getDeliveryAgentByProfileId(user.id);

        if (!isActive) return;
        setState({
          deliveryAgentId: agent.id,
          isLoading: false,
          errorMessage: null,
        });
      } catch (error) {
        if (!isActive) return;
        setState({
          deliveryAgentId: null,
          isLoading: false,
          errorMessage: error instanceof Error ? error.message : 'Failed to load agent profile',
        });
      }
    })();

    return () => {
      isActive = false;
    };
  }, []);

  return state;
}

