import React, { createContext, useEffect, useState, useRef } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { UserProfile } from '../types';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  signOut: () => Promise<void>;
  isLoading: boolean;
  authError: string | null;
  clearAuthError: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  signOut: async () => {},
  isLoading: true,
  authError: null,
  clearAuthError: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const userRef = useRef<User | null>(null);
  const profileRef = useRef<UserProfile | null>(null);

  const clearAuthError = () => setAuthError(null);

  const fetchAndSetProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          // User is not preauthorized (no profile created)
          await supabase.auth.signOut();
          setAuthError("You have not been enrolled or authorized to access the application. Contact the system administration for assistance.");
          return null;
        }
        console.error('Error fetching profile:', error);
        return null;
      }
      
      const profileData = data as UserProfile;
      
      if (profileData.is_deleted) {
        // User is blocked
        await supabase.auth.signOut();
        setAuthError("Your account has been blocked. Please contact the system administration for assistance.");
        return null;
      }
      
      setProfile(profileData);
      profileRef.current = profileData;
      setAuthError(null);
      return profileData;
    } catch (err) {
      console.error('Unexpected error fetching profile:', err);
      return null;
    }
  };

  useEffect(() => {
    // 1. Handle OAuth Popup Closing
    // Check if this window was opened as a popup and has auth results in the URL
    const isPopup = window.opener && window.opener !== window;
    const hash = window.location.hash;
    const search = window.location.search;
    const hasAuthResult = hash.includes('access_token') || 
                          hash.includes('error') || 
                          search.includes('code=') || 
                          search.includes('error=');

    if (isPopup && hasAuthResult) {
      // Pass the error to the opener if it exists
      const params = new URLSearchParams(hash.replace('#', '?'));
      const errorDescription = params.get('error_description') || search.match(/error_description=([^&]+)/)?.[1];
      
      if (errorDescription && window.opener) {
        window.opener.postMessage(
          { type: 'OAUTH_ERROR', error: decodeURIComponent(errorDescription) },
          window.location.origin
        );
      }

      // Give a tiny delay to ensure Supabase's internal listeners 
      // (like those in other tabs) have processed the result before closing.
      const timer = setTimeout(() => {
        window.close();
      }, 500);
      return () => clearTimeout(timer);
    }

    // 1.5 Listen for OAuth errors from popup
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === 'OAUTH_ERROR') {
        // If Supabase blocked the login (e.g. via database trigger), it returns an error here
        setAuthError("You have not been enrolled or authorized to access the application. Contact the system administration for assistance.");
        setIsLoading(false);
      }
    };
    window.addEventListener('message', handleMessage);

    // 2. Auth initialization and listeners
    let mounted = true;

    const handleAuthStateChange = async (event: string, currentSession: Session | null) => {
      if (!mounted) return;

      const newUser = currentSession?.user ?? null;
      const isLoggingIn = !userRef.current && newUser;
      const isLoggingOut = userRef.current && !newUser;
      
      userRef.current = newUser;

      if (newUser) {
        setSession(currentSession);
        setUser(newUser);
        
        // Only trigger global loading state if we are transitioning from NO user
        // or if it's the very first initialization and we don't have a profile yet.
        // This prevents the "flash" when switching tabs since the user is already tracked.
        if (isLoggingIn || (event === 'INITIAL_SESSION' && !profileRef.current)) {
          setIsLoading(true);
        }
        
        await fetchAndSetProfile(newUser.id);
      } else {
        setSession(null);
        setUser(null);
        setProfile(null);
        profileRef.current = null;
        
        // If we are logging out, ensure loading is false
        if (isLoggingOut) {
          setIsLoading(false);
        }
      }
      
      if (mounted) {
        setIsLoading(false);
      }
    };

    // Initial session check
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      handleAuthStateChange('INITIAL_SESSION', initialSession);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      // console.log('Auth state change:', event, currentSession?.user?.email);
      
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'SIGNED_OUT' || event === 'USER_UPDATED') {
        handleAuthStateChange(event, currentSession);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ session, user, profile, signOut, isLoading, authError, clearAuthError }}>
      {children}
    </AuthContext.Provider>
  );
};
