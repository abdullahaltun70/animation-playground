'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

import { createClient } from '@/app/utils/supabase/client';

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  const refreshSession = async () => {
    try {
      setIsLoading(true);
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error) {
        // If it's an AuthSessionMissingError, treat as no user (not logged in)
        if (error.message?.includes('Auth session missing')) {
          console.log('No active session found during refresh');
          setUser(null);
          setIsAuthenticated(false);
          return;
        }
        console.error('Error refreshing session:', error);
      }
      setUser(user);
      setIsAuthenticated(!!user);
    } catch (error) {
      // Handle AuthSessionMissingError specifically
      if (
        error instanceof Error &&
        error.message?.includes('Auth session missing')
      ) {
        console.log('No active session found during refresh (catch block)');
        setUser(null);
        setIsAuthenticated(false);
      } else {
        console.error('Error refreshing session:', error);
        setUser(null);
        setIsAuthenticated(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const unsubRef = { current: undefined as undefined | (() => void) };
    let didUnmount = false;
    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        const {
          data: { user },
          error: getUserError,
        } = await supabase.auth.getUser();
        if (getUserError) {
          // If it's an AuthSessionMissingError, treat as no user (not logged in)
          if (getUserError.message?.includes('Auth session missing')) {
            console.log('No active session found, user not authenticated');
          } else {
            console.error('Error fetching initial user:', getUserError);
          }
        }
        if (!didUnmount) {
          setUser(user);
          setIsAuthenticated(!!user);
        }
        // Remove initial router.refresh to prevent infinite loops
        // Router refresh will be handled by auth state changes if needed
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
          const currentUser = session?.user;
          if (!didUnmount) {
            setUser(currentUser || null);
            setIsAuthenticated(!!currentUser);
          }
          if (event === 'SIGNED_IN') {
            console.log(
              'AuthProvider: SIGNED_IN event detected, current path:',
              window.location.pathname
            );
            if (
              window.location.pathname.includes('/login') ||
              window.location.pathname.includes('/auth')
            ) {
              console.log(
                'AuthProvider: Redirecting to / from login or auth page'
              );
              router.push('/');
            }
            // Remove router.refresh for SIGNED_IN to prevent infinite loops
          } else if (event === 'SIGNED_OUT') {
            console.log(
              'AuthProvider: SIGNED_OUT event detected, current path:',
              window.location.pathname
            );
            if (!window.location.pathname.includes('/login')) {
              console.log('AuthProvider: Redirecting to /login');
              router.push('/login');
            }
            if (typeof router.refresh === 'function') {
              router.refresh();
            }
          }
        });
        unsubRef.current = () => subscription.unsubscribe();
      } catch (error) {
        // Handle AuthSessionMissingError specifically
        if (
          error instanceof Error &&
          error.message?.includes('Auth session missing')
        ) {
          console.log('No active session found during initialization');
          if (!didUnmount) {
            setUser(null);
            setIsAuthenticated(false);
          }
        } else {
          console.error('Error initializing auth:', error);
        }
      } finally {
        if (!didUnmount) setIsLoading(false);
      }
    };
    initializeAuth();
    return () => {
      didUnmount = true;
      if (unsubRef.current) {
        unsubRef.current();
        unsubRef.current = undefined;
      }
    };
  }, [supabase, router]);

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
        return;
      }
      setUser(null);
      setIsAuthenticated(false);
      router.push('/login');
      if (typeof router.refresh === 'function') {
        router.refresh();
      }
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        signOut,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
