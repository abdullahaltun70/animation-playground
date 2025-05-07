// src/components/profile/SignOutButton.tsx
'use client';

import { useState } from 'react';

import { Button } from '@radix-ui/themes';
import { redirect } from 'next/navigation';

import { createClient } from '@/app/utils/supabase/client';

import styles from '../styles/components.module.scss';

export function SignOutButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      window.location.reload();
      redirect('/');
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleSignOut}
      disabled={isLoading}
      className={styles.signOutButton}
    >
      {isLoading ? 'Signing out...' : 'Sign Out'}
    </Button>
  );
}
