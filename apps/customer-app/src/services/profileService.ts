import { supabase } from '../lib/supabase';

export const getProfile = async (
  userId: string
) => {
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