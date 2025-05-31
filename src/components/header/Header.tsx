// src/components/header/Header.tsx
'use client';

import React from 'react';

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
import { ThemeToggle } from '@/components/theme-toggle';
import { useAuth } from '@/context/AuthProvider';

import styles from './Header.module.scss';

/**
 * @component Header
 * @description Renders the application header, including navigation links, theme toggle, and user authentication status/menu.
 * Uses the AuthProvider context to get authentication state instead of managing its own state.
 * This component does not accept any props.
 */
export const Header = () => {
  const pathname = usePathname();
  const { user, isLoading: isLoadingAuth, isAuthenticated } = useAuth();

  return (
    <header
      className={`${styles.header} fade-in`}
      data-cy="main-nav"
      role="banner"
    >
      <div className={styles.headerContent}>
        <Flex gap="6" align="center" className={styles.leftSection}>
          <RadixLink
            href="/"
            className={styles.logoContainer}
            data-cy="nav-home"
          >
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
              data-cy="nav-playground"
            >
              Playground
            </RadixLink>

            <RadixLink
              href={'/documentation'}
              className={pathname === '/documentation' ? styles.active : ''}
              weight={pathname === '/documentation' ? 'bold' : 'regular'}
              data-cy="nav-documentation"
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
                    {user?.email && (
                      <DropdownMenu.Label data-cy="user-email-label">
                        <Text size="2" color="gray">
                          {user.email}
                        </Text>
                      </DropdownMenu.Label>
                    )}
                    <DropdownMenu.Item asChild>
                      <RadixLink href="/profile" data-cy="user-profile-link">
                        <PersonIcon
                          width="16"
                          height="16"
                          style={{ marginRight: '8px' }}
                          data-cy="user-profile"
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
