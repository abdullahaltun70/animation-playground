'use client';

import { useEffect } from 'react';

import { Spinner } from '@radix-ui/themes';
import { useRouter } from 'next/navigation';

import { createClient } from '@/app/utils/supabase/client';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const syncSessionAndRedirect = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        router.replace('/');
      } else {
        router.replace('/login');
      }
    };
    syncSessionAndRedirect();
  }, [router]);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          background: 'var(--card-bg)',
          padding: '2rem 3rem',
          borderRadius: '1rem',
          boxShadow: '0 8px 32px rgba(60, 72, 88, 0.12)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.5rem',
        }}
      >
        <Spinner size="3" />
        <div
          style={{
            fontSize: '1.25rem',
            fontWeight: 500,
            color: 'var(--text-primary)',
            textAlign: 'center',
          }}
        >
          Signing you in...
        </div>
        <div
          style={{
            fontSize: '1rem',
            color: 'var(--text-secondary)',
            textAlign: 'center',
          }}
        >
          Please wait while we redirect you to your dashboard.
        </div>
      </div>
    </div>
  );
}
