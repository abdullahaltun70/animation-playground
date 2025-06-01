'use client';

import { useState, useEffect } from 'react';

import { PersonIcon } from '@radix-ui/react-icons';
import { Avatar } from '@radix-ui/themes';

import { useAuth } from '@/context/AuthProvider';

import styles from '../../../../components/profile/UserAvatar.module.scss';

/**
 * @component UserAvatar
 * @description Displays the user's avatar, showing either their profile picture or initials.
 * Uses the AuthProvider context to get user data instead of making its own Supabase calls.
 * Handles loading and unauthenticated states gracefully.
 * This component does not accept any props.
 */
export function UserAvatar() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [initials, setInitials] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    // Reset state when user changes
    if (!user) {
      setInitials('');
      setImageUrl(null);
      return;
    }

    // Process user data to extract initials and image
    if (user.user_metadata && Object.keys(user.user_metadata).length > 0) {
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
  }, [user]); // Only depend on user from AuthProvider context

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
        fallback={
          // make this url the fallback for the avatar
          <PersonIcon
            style={{ width: '100%', height: '100%' }}
            className={styles.personIcon}
          />
        } // Radix UI PersonIcon as fallback
        data-cy="user-profile"
      />
    );
  }

  // If authenticated, display the user's avatar image if available, otherwise fallback to initials.
  return (
    <Avatar
      size="2"
      radius="full"
      src={
        imageUrl ||
        'https://img.icons8.com/?size=100&id=Cssf43cjx2fu&format=png&color=000000'
      }
      fallback={initials}
      className={styles.userAvatar}
      data-cy="user-profile"
    />
  );
}
