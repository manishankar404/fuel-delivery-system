import { supabase }
from '../lib/supabase';

export const getProfilePushToken =
  async (
    profileId: string
  ) => {
    const {
      data,
      error,
    } =
      await supabase
        .from('profiles')
        .select(
          'expo_push_token'
        )
        .eq(
          'id',
          profileId
        )
        .maybeSingle();       

    if (error) {
      throw error;
    }

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