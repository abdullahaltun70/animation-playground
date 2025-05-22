'use client';

import { useState, useEffect } from 'react';

import { PersonIcon } from '@radix-ui/react-icons';
import { Avatar } from '@radix-ui/themes';

import { createClient } from '@/app/utils/supabase/client';

import styles from '../../../../components/profile/UserAvatar.module.scss';

/**
 * @component UserAvatar
 * @description Displays the user's avatar, showing either their profile picture or initials.
 * It fetches user data from Supabase upon mounting and updates in response to
 * authentication state changes (sign-in, sign-out). Handles loading and
 * unauthenticated states gracefully.
 * This component does not accept any props.
 */
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

          if (
            user.user_metadata &&
            Object.keys(user.user_metadata).length > 0
          ) {
            // Attempt to get full name and picture from user metadata (common with OAuth providers)
            const fullName =
              user.user_metadata.name || user.user_metadata.full_name || '';
            const picture =
              user.user_metadata.picture || user.user_metadata.avatar_url;

            // Generate initials from the full name
            const names = fullName.split(' ');
            let userInitials = '';
            if (names.length >= 2) {
              userInitials =
                `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
            } else if (names.length === 1 && names[0]) {
              userInitials = names[0][0].toUpperCase(); // Single name, use first letter
            }

            setInitials(userInitials);
            setImageUrl(picture);
          } else if (user.email) {
            // Fallback for users without extensive metadata (e.g., email/password sign-ups):
            // Use the first two letters of the email address as initials.
            const emailInitials = user.email.substring(0, 2).toUpperCase();
            setInitials(emailInitials);
          }
        } else {
          // No user is signed in
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

    // Subscribe to authentication state changes to update avatar accordingly
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
    // Display a placeholder avatar while loading
    // Render a simple placeholder during the initial loading phase.
    return <Avatar size="2" radius="full" fallback="" />;
  }

  if (!isAuthenticated) {
    // If no user is authenticated, display a generic person icon.
    return (
      <Avatar
        size="2"
        radius="full"
        className={styles.userAvatar}
        fallback={<PersonIcon width="16" height="16" />} // Radix UI PersonIcon as fallback
      />
    );
  }

  // If authenticated, display the user's avatar image if available, otherwise fallback to initials.
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
