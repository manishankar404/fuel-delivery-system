import { supabase } from '../lib/supabase';

export const signInAdmin =
  async (
    email: string,
    password: string
  ) => {
    const { data, error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (error) {
      throw error;
    }

    return data;
  };

export const signOutAdmin =
  async () => {
    const { error } =
      await supabase.auth.signOut();

    if (error) {
      throw error;
    }
  };