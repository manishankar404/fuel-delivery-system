import { supabase } from '../lib/supabase';

import {
  CreateOrderPayload,
} from '../types/order';

export const getFuelTypes =
  async () => {
    const { data, error } =
      await supabase
        .from('fuel_types')
        .select('*');

    console.log(
      'Fuel Types:',
      data
    );

    console.log(
      'Fuel Type Error:',
      error
    );

    if (error) {
      throw error;
    }

    return data;
  };

export const createOrder =
  async (
    payload: CreateOrderPayload
  ) => {
    console.log(
      'Creating Order:',
      payload
    );

    const { data, error } =
      await supabase
        .from('orders')
        .insert(payload)
        .select()
        .single();

    console.log(
      'Order Response:',
      data
    );

    console.log(
      'Order Error:',
      error
    );

    if (error) {
      throw error;
    }

    return data;
  };
  export const getCustomerOrders =
  async (
    customerId: string
  ) => {
    const { data, error } =
      await supabase
        .from('orders')
        .select(`
          *,
          fuel_types (
            name
          )
        `)
        .eq(
          'customer_id',
          customerId
        )
        .order(
          'created_at',
          {
            ascending: false,
          }
        );

    console.log(
      'Customer Orders:',
      data
    );

    console.log(
      'Customer Orders Error:',
      error
    );

    if (error) {
      throw error;
    }

    return data;
  };