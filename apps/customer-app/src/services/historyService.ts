import { supabase }
from '../lib/supabase';

export const getOrderHistory =
  async (
    orderId: string
  ) => {
    const {
      data,
      error,
    } =
      await supabase
        .from(
          'order_status_history'
        )
        .select('*')
        .eq(
          'order_id',
          orderId
        )
        .order(
          'created_at',
          {
            ascending: true,
          }
        );

    if (error) {
      throw error;
    }

    return data;
  };