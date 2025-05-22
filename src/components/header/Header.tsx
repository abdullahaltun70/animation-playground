// src/components/header/Header.tsx
'use client';

import React, { useEffect, useState } from 'react';

import { ExitIcon, PersonIcon } from '@radix-ui/react-icons';
import {
  Button,
  DropdownMenu,
  Flex,
  Link as RadixLink,
  Text,
} from '@radix-ui/themes';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

import { SignOutButton } from '@/app/(main)/profile/components/SignOutButton';
import { UserAvatar } from '@/app/(main)/profile/components/UserAvatar';
import { createClient } from '@/app/utils/supabase/client';
import { ThemeToggle } from '@/components/theme-toggle';

import styles from './Header.module.scss';

/**
 * @component Header
 * @description Renders the application header, including navigation links, theme toggle, and user authentication status/menu.
 * It manages its own authentication state by interacting with Supabase.
 * This component does not accept any props.
 */
export const Header = () => {
  const pathname = usePathname();
  const supabase = createClient();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    // Initial check for user authentication status
    const checkAuth = async () => {
      setIsLoadingAuth(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
      setUserEmail(user?.email || null);
      setIsLoadingAuth(false);
    };

    checkAuth();

    // Listen for auth state changes handled by onAuthStateChange
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user;
      setIsAuthenticated(!!user);
      setUserEmail(user?.email || null);
      setIsLoadingAuth(false);
    });

    // Cleanup subscription on unmount
    return () => {
      subscription?.unsubscribe();
    };
  }, [supabase.auth]); // supabase.auth dependency ensures effect re-runs if the auth instance changes

  return (
    <header className={`${styles.header} fade-in`}>
      <div className={styles.headerContent}>
        <Flex gap="6" align="center" className={styles.leftSection}>
          <RadixLink href="/" className={styles.logoContainer}>
            <div className={styles.logo}>
              <Image
                src="/logo.png"
                alt="Animation Playground Logo"
                width={'36'}
                height={'36'}
              />
            </div>
          </RadixLink>

          <nav className={styles.nav}>
            <RadixLink
              href={'/'}
              className={pathname === '/' ? styles.active : ''}
              weight={pathname === '/' ? 'bold' : 'regular'}
            >
              Playground
            </RadixLink>

            <RadixLink
              href={'/documentation'}
              className={pathname === '/documentation' ? styles.active : ''}
              weight={pathname === '/documentation' ? 'bold' : 'regular'}
            >
              Documentation
            </RadixLink>
          </nav>
        </Flex>

        <div className={styles.rightSection}>
          {!isLoadingAuth && (
            <DropdownMenu.Root>
              <DropdownMenu.Trigger>
                <Button
                  className={styles.avatarTriggerButton}
                  aria-label="User menu"
                >
                  <UserAvatar />
                </Button>
              </DropdownMenu.Trigger>

              <DropdownMenu.Content align="end">
                {isAuthenticated ? (
                  <>
                    {userEmail && (
                      <DropdownMenu.Label>
                        <Text size="2" color="gray">
                          {userEmail}
                        </Text>
                      </DropdownMenu.Label>
                    )}
                    <DropdownMenu.Item asChild>
                      <RadixLink href="/profile">
                        <PersonIcon
                          width="16"
                          height="16"
                          style={{ marginRight: '8px' }}
                        />
                        Profile
                      </RadixLink>
                    </DropdownMenu.Item>
                    <DropdownMenu.Separator />

                    <DropdownMenu.Item asChild>
                      <SignOutButton />
                    </DropdownMenu.Item>
                  </>
                ) : (
                  <DropdownMenu.Item asChild>
                    <RadixLink href="/login">
                      <ExitIcon
                        width="16"
                        height="16"
                        style={{
                          transform: 'scaleX(-1)', // Visually indicates "Sign In" action
                          marginRight: '8px',
                        }}
                      />
                      Sign In
                    </RadixLink>
                  </DropdownMenu.Item>
                )}
              </DropdownMenu.Content>
            </DropdownMenu.Root>
          )}
          {isLoadingAuth && (
            // Render a placeholder or the UserAvatar directly while loading
            // UserAvatar might have its own loading state or show a default
            <div className={styles.avatarTriggerButton}>
              <UserAvatar />
            </div>
          )}

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};
