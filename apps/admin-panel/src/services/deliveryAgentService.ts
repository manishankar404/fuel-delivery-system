import { supabase }
from '../lib/supabase';

export const getDeliveryAgents =
  async () => {
    const {
      data,
      error,
    } =
      await supabase
        .from(
          'delivery_agents'
        )
        .select(`
          id,
          profile_id,
          vehicle_number,
          is_available,
          profiles (
            id,
            full_name,
            email,
            phone_number
          )
        `);

    if (error) {
      throw error;
    }

    return data;
  };

  export const assignDeliveryAgent =
  async (
    orderId: string,
    deliveryAgentId: string
  ) => {
    const { error } =
      await supabase
        .from('orders')
        .update({
          assigned_delivery_agent_id:
            deliveryAgentId,

          status:
            'assigned',
        })
        .eq(
          'id',
          orderId
        );

    if (error) {
      throw error;
    }
  };