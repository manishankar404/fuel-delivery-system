import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from 'react';

import { Session } from '@supabase/supabase-js';

import { supabase } from '../lib/supabase';

import { getProfile, updateProfile } from '../services/profileService';

import { Profile } from '../types/profile';

import {
  registerForPushNotifications,
} from '../services/notificationService';

interface AuthContextType {
  session: Session | null;

  profile: Profile | null;

  loading: boolean;

  updateProfile: (updates: Partial<Profile>) => Promise<Profile>;

  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  profile: null,
  loading: true,
  updateProfile: async () => { throw new Error('Not initialized'); },
  refreshProfile: async () => { throw new Error('Not initialized'); },
});

export const AuthProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [session, setSession] =
    useState<Session | null>(null);

  const [profile, setProfile] =
    useState<Profile | null>(null);

  const [loading, setLoading] =
    useState(true);

  const fetchProfile = useCallback(async (
    userId: string
  ) => {
    try {
      const profileData =
        await getProfile(userId);

      setProfile(profileData);

      await registerForPushNotifications();
    } catch (error) {
      console.log(
        'Profile Fetch Error:',
        error
      );
    }
  }, []);

  const handleUpdateProfile = useCallback(async (
    updates: Partial<Profile>
  ) => {
    if (!session?.user?.id) {
      throw new Error('No user session');
    }

    const updatedProfile = await updateProfile(
      session.user.id,
      {
        full_name: updates.full_name,
        phone_number: updates.phone_number,
        email: updates.email,
      }
    );

    setProfile(updatedProfile);
    return updatedProfile;
  }, [session?.user?.id]);

  const handleRefreshProfile = useCallback(async () => {
    if (!session?.user?.id) {
      throw new Error('No user session');
    }

    await fetchProfile(session.user.id);
  }, [session?.user?.id, fetchProfile]);

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(async ({ data: { session } }) => {
        setSession(session);

        if (session?.user?.id) {
          await fetchProfile(
            session.user.id
          );
        }

        setLoading(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);

        if (session?.user?.id) {
          await fetchProfile(
            session.user.id
          );
        } else {
          setProfile(null);
        }

        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  return (
    <AuthContext.Provider
      value={{
        session,
        profile,
        loading,
        updateProfile: handleUpdateProfile,
        refreshProfile: handleRefreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () =>
  useContext(AuthContext);
