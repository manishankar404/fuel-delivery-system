import { supabase } from '../lib/supabase';

export const getProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const getDeliveryAgentFull = async (agentId: string) => {
  const { data, error } = await supabase
    .from('delivery_agents')
    .select('*, profiles(*)')
    .eq('id', agentId)
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const updateProfile = async (
  userId: string,
  updates: {
    full_name?: string;
    phone_number?: string;
    email?: string;
  }
) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const updateDeliveryAgent = async (
  agentId: string,
  updates: {
    vehicle_number?: string;
    is_available?: boolean;
  }
) => {
  const { data, error } = await supabase
    .from('delivery_agents')
    .update(updates)
    .eq('id', agentId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const getTotalDeliveries = async (agentId: string) => {
  const { count, error } = await supabase
    .from('orders')
    .select('id', { count: 'exact', head: true })
    .eq('assigned_delivery_agent_id', agentId)
    .eq('status', 'delivered');

  if (error) {
    throw error;
  }

  return count || 0;
};
