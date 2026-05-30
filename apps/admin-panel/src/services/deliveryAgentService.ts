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
          vehicle_number,
          profiles (
            full_name,
            email
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