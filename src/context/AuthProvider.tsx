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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
      } = await supabase.auth.getUser();
      setUser(user);
      setIsAuthenticated(!!user);
    } catch (error) {
      console.error('Error refreshing session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsLoading(true);

        // Haal de huidige gebruiker op
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setUser(user);
        setIsAuthenticated(!!user);
        // If user is already available on init and not on an auth page, consider redirecting or refreshing
        // This part might need adjustment based on initial load behavior desired
        if (
          user &&
          !window.location.pathname.startsWith('/login') &&
          !window.location.pathname.startsWith('/auth')
        ) {
          // Potentially router.refresh() if needed for server components
          console.log(
            'AuthProvider: User already authenticated, refreshing router.'
          );
          router.refresh();
        }

        // Luister naar auth state changes
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
          const currentUser = session?.user;
          setUser(currentUser || null);
          setIsAuthenticated(!!currentUser);

          if (event === 'SIGNED_IN') {
            console.log(
              'AuthProvider: SIGNED_IN event detected, current path:',
              window.location.pathname
            );
            // Only redirect if we are on an auth-related page or login page.
            if (
              window.location.pathname.includes('/login') ||
              window.location.pathname.includes('/auth')
            ) {
              console.log(
                'AuthProvider: Redirecting to / from login or auth page'
              );
              // router.push(`${window.location.origin}/auth/callback`);
              router.push('/');
            } else {
              // If already on another page (e.g., user was on /dashboard and session got refreshed)
              // just refresh the router to update server components if necessary.
              console.log(
                'AuthProvider: SIGNED_IN on a non-auth page, refreshing router.'
              );
              router.refresh();
            }
          } else if (event === 'SIGNED_OUT') {
            console.log(
              'AuthProvider: SIGNED_OUT event detected, current path:',
              window.location.pathname
            );
            if (!window.location.pathname.includes('/login')) {
              console.log('AuthProvider: Redirecting to /login');
              router.push('/login');
            }
            // Always refresh after push to ensure server components are updated for logged-out state
            router.refresh();
          }
        });

        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [supabase, router]);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setIsAuthenticated(false);
      router.push('/login');
      router.refresh();
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
