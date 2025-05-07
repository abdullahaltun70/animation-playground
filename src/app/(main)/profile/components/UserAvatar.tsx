'use client';

import { useState, useEffect } from 'react';

import { PersonIcon } from '@radix-ui/react-icons';
import { Avatar } from '@radix-ui/themes';

import { createClient } from '@/app/utils/supabase/client';

import styles from '../../../../components/profile/UserAvatar.module.scss';

export function UserAvatar() {
  const [initials, setInitials] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const getUserData = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          setIsAuthenticated(true);

          // Generate initials from email if no metadata is available
          if (
            user.user_metadata &&
            Object.keys(user.user_metadata).length > 0
          ) {
            // Get name from Google metadata
            const fullName =
              user.user_metadata.name || user.user_metadata.full_name || '';

            // Get image from Google metadata
            const picture =
              user.user_metadata.picture || user.user_metadata.avatar_url;

            // Generate initials from full name
            const names = fullName.split(' ');
            let userInitials = '';

            if (names.length >= 2) {
              userInitials =
                `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
            } else if (names.length === 1 && names[0]) {
              userInitials = names[0][0].toUpperCase();
            }

            setInitials(userInitials);
            setImageUrl(picture);
          } else if (user.email) {
            // For email login: use first two letters of email
            const emailInitials = user.email.substring(0, 2).toUpperCase();
            setInitials(emailInitials);
          }
        } else {
          setIsAuthenticated(false);
          setInitials('');
          setImageUrl(null);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    getUserData();

    // Subscribe to auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        setInitials('');
        setImageUrl(null);
      } else if (event === 'SIGNED_IN' && session?.user) {
        getUserData();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

  if (isLoading) {
    return <Avatar size="2" radius="full" fallback="" />;
  }

  if (!isAuthenticated) {
    return (
      <Avatar
        size="2"
        radius="full"
        className={styles.userAvatar}
        fallback={<PersonIcon width="16" height="16" />}
      />
    );
  }

  return (
    <Avatar
      size="2"
      radius="full"
      src={imageUrl || undefined}
      fallback={initials}
      className={styles.userAvatar}
    />
  );
}
