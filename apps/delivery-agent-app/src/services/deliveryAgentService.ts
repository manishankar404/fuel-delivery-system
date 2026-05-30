import { supabase } from '../lib/supabase';

export const getDeliveryAgentByProfileId =
  async (
    profileId: string
  ) => {
    const { data, error } =
      await supabase
        .from('delivery_agents')
        .select('*')
        .eq(
          'profile_id',
          profileId
        )
        .single();

    if (error) {
      throw error;
    }

    return data;
  };