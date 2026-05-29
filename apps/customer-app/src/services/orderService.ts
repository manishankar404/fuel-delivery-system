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