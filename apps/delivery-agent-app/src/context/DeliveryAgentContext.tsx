import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';

import { supabase } from '../lib/supabase';
import { getDeliveryAgentFull, updateProfile, updateDeliveryAgent, getTotalDeliveries } from '../services/profileService';
import type { DeliveryAgentProfile } from '../types/profile';

type DeliveryAgentContextValue = {
  deliveryAgentId: string | null;
  profile: DeliveryAgentProfile | null;
  loading: boolean;
  updateProfile: (updates: Partial<DeliveryAgentProfile>) => Promise<DeliveryAgentProfile>;
  updateDeliveryAgent: (updates: { vehicle_number?: string; is_available?: boolean }) => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const DeliveryAgentContext = createContext<DeliveryAgentContextValue>({
  deliveryAgentId: null,
  profile: null,
  loading: true,
  updateProfile: async () => { throw new Error('Not initialized'); },
  updateDeliveryAgent: async () => { throw new Error('Not initialized'); },
  refreshProfile: async () => { throw new Error('Not initialized'); },
});

export function DeliveryAgentProvider({
  deliveryAgentId,
  children,
}: {
  deliveryAgentId: string | null;
  children: ReactNode;
}) {
  const [profile, setProfile] = useState<DeliveryAgentProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    if (!deliveryAgentId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const agentData = await getDeliveryAgentFull(deliveryAgentId);
      const deliveries = await getTotalDeliveries(deliveryAgentId);

      setProfile({
        id: agentData.profiles?.id || deliveryAgentId,
        full_name: agentData.profiles?.full_name || null,
        email: agentData.profiles?.email || '',
        phone_number: agentData.profiles?.phone_number || null,
        role: 'delivery_agent',
        is_active: agentData.profiles?.is_active ?? true,
        created_at: agentData.profiles?.created_at,
        vehicle_number: agentData.vehicle_number || undefined,
        is_available: agentData.is_available ?? false,
        total_deliveries: deliveries,
      });
    } catch (error) {
      console.log('Failed to fetch agent profile:', error);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [deliveryAgentId]);

  const handleUpdateProfile = useCallback(async (
    updates: Partial<DeliveryAgentProfile>
  ): Promise<DeliveryAgentProfile> => {
    if (!profile?.id) {
      throw new Error('No profile loaded');
    }

    const updatedProfileData = await updateProfile(profile.id, {
      full_name: updates.full_name,
      phone_number: updates.phone_number,
      email: updates.email,
    });

    const updated = { ...profile, ...updatedProfileData, ...updates };
    setProfile(updated);
    return updated;
  }, [profile]);

  const handleUpdateDeliveryAgent = useCallback(async (
    updates: { vehicle_number?: string; is_available?: boolean }
  ) => {
    if (!deliveryAgentId) {
      throw new Error('No agent ID');
    }

    await updateDeliveryAgent(deliveryAgentId, updates);

    if (profile) {
      setProfile({
        ...profile,
        vehicle_number: updates.vehicle_number ?? profile.vehicle_number,
        is_available: updates.is_available ?? profile.is_available,
      });
    }
  }, [deliveryAgentId, profile]);

  const handleRefreshProfile = useCallback(async () => {
    await fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    void fetchProfile();
  }, [fetchProfile]);

  return (
    <DeliveryAgentContext.Provider
      value={{
        deliveryAgentId,
        profile,
        loading,
        updateProfile: handleUpdateProfile,
        updateDeliveryAgent: handleUpdateDeliveryAgent,
        refreshProfile: handleRefreshProfile,
      }}
    >
      {children}
    </DeliveryAgentContext.Provider>
  );
}

export function useDeliveryAgentId() {
  return useContext(DeliveryAgentContext).deliveryAgentId;
}

export function useDeliveryAgentProfile() {
  return useContext(DeliveryAgentContext);
}
