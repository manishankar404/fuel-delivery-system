import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';

import { Session } from '@supabase/supabase-js';

import { supabase } from '../lib/supabase';

import { getProfile } from '../services/profileService';

import { Profile } from '../types/profile';

import {
  registerForPushNotifications,
} from '../services/notificationService';

interface AuthContextType {
  session: Session | null;

  profile: Profile | null;

  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  profile: null,
  loading: true,
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

  const fetchProfile = async (
    userId: string
  ) => {
    try {
      const profileData =
        await getProfile(userId);

      setProfile(profileData);

      await registerForPushNotifications(
        profileData.id
      );
    } catch (error) {
      console.log(
        'Profile Fetch Error:',
        error
      );
    }
  };

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
  }, []);

  return (
    <AuthContext.Provider
      value={{
        session,
        profile,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () =>
  useContext(AuthContext);