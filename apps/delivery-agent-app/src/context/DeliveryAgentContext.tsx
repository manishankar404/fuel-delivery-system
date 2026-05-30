import type { ReactNode } from 'react';
import { createContext, useContext } from 'react';

type DeliveryAgentContextValue = {
  deliveryAgentId: string | null;
};

const DeliveryAgentContext = createContext<DeliveryAgentContextValue>({
  deliveryAgentId: null,
});

export function DeliveryAgentProvider({
  deliveryAgentId,
  children,
}: {
  deliveryAgentId: string | null;
  children: ReactNode;
}) {
  return (
    <DeliveryAgentContext.Provider value={{ deliveryAgentId }}>
      {children}
    </DeliveryAgentContext.Provider>
  );
}

export function useDeliveryAgentId() {
  return useContext(DeliveryAgentContext).deliveryAgentId;
}
