import { supabase } from '../lib/supabase';

import type { DeliveryOrder } from '../types/order';

export const getAssignedOrders =
  async (
    deliveryAgentId: string
  ) => {
    const { data, error } =
      await supabase
        .from('orders')
        .select(`
          *,
          fuel_types (
            name
          ),
          profiles (
            email
          )
        `)
        .eq(
          'assigned_delivery_agent_id',
          deliveryAgentId
        )
        .order(
          'created_at',
          {
            ascending: false,
          }
        );

    if (error) {
      throw error;
    }

    return (data ?? []) as DeliveryOrder[];
  };

export const updateOrderStatus =
  async (
    orderId: string,
    status: string
  ) => {
    const { data, error } =
      await supabase
        .from('orders')
        .update({
          status,
        })
        .eq('id', orderId)
        .select()
        .single();

    if (error) {
      throw error;
    }

    return data;
  };
