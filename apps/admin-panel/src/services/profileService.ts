import { supabase } from '../lib/supabase';

export const getProfilePushToken = async (profileId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('expo_push_token')
    .eq('id', profileId)
    .maybeSingle();

  if (error) {
    throw error;
  }

<<<<<<< HEAD
  return data?.expo_push_token;
};

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

export const listCustomers = async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*, customer_wallets(*), orders(id)')
    .eq('role', 'customer')
    .eq('is_active', true);

  if (error) {
    throw error;
  }

  return data || [];
};

export const listDeliveryAgents = async () => {
  const { data, error } = await supabase
    .from('delivery_agents')
    .select('*, profiles(*)');

  if (error) {
    throw error;
  }

  return data || [];
};

export const listAdmins = async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'admin')
    .eq('is_active', true);

  if (error) {
    throw error;
  }

  return data || [];
};

export const getCustomerStats = async (customerId: string) => {
  const [ordersRes, walletRes] = await Promise.all([
    supabase
      .from('orders')
      .select('id, status')
      .eq('customer_id', customerId),
    supabase
      .from('customer_wallets')
      .select('*')
      .eq('customer_id', customerId)
      .maybeSingle(),
  ]);

  if (ordersRes.error) throw ordersRes.error;
  if (walletRes.error) throw walletRes.error;

  const orders = ordersRes.data || [];
  const wallet = walletRes.data;

  return {
    total_orders: orders.length,
    delivered_orders: orders.filter((o) => o.status === 'delivered').length,
    wallet_balance: wallet?.balance ?? 0,
  };
};

export const getAgentStats = async (agentId: string) => {
  const { data, error } = await supabase
    .from('orders')
    .select('id, status')
    .eq('assigned_delivery_agent_id', agentId);

  if (error) {
    throw error;
  }

  const orders = data || [];
  return {
    total_deliveries: orders.length,
    completed_deliveries: orders.filter((o) => o.status === 'delivered').length,
  };
};
=======
    return data
      ?.expo_push_token;
  };

export const getCustomers =
  async () => {
    const {
      data,
      error,
    } =
      await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          email,
          phone_number,
          role
        `)
        .eq('role', 'customer')
        .order('full_name', { ascending: true });

    if (error) {
      throw error;
    }

    return data;
  };
>>>>>>> d641c1ea25d72072f838a28e01cb154f371b0e0c
