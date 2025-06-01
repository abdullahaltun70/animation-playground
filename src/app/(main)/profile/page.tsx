'use client';

import React, { useCallback, useEffect, useState } from 'react';

import {
  CopyIcon,
  PersonIcon,
  GearIcon,
  ArchiveIcon,
} from '@radix-ui/react-icons';
import {
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  Dialog,
  Flex,
  Heading,
  Separator,
  Tabs,
  Text,
} from '@radix-ui/themes';
import { useRouter } from 'next/navigation';

import AlertNotification from '@/app/(auth)/login/components/AlertComponent';
import { createClient } from '@/app/utils/supabase/client';
import { useAuth } from '@/context/AuthProvider';
import { useToast } from '@/context/ToastContext';
import { ConfigModel } from '@/types/animations';

import ConfigList from './components/ConfigList';
import styles from './Profile.module.scss';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [allConfigs, setAllConfigs] = useState<ConfigModel[]>([]);
  const [userConfigs, setUserConfigs] = useState<ConfigModel[]>([]);
  const [userConfigsLoading, setUserConfigsLoading] = useState(true);
  const [allConfigsLoading, setAllConfigsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [configToDeleteId, setConfigToDeleteId] = useState<string | null>(null);
  const { showToast } = useToast();

  /**
   * Fetches all publicly available animation configurations.
   */
  const fetchAllConfigs = useCallback(async () => {
    setAllConfigsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/configs', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch All configurations');
      }

      const data = await response.json();
      if (Array.isArray(data)) {
        setAllConfigs(data);
      } else if (data.configs && Array.isArray(data.configs)) {
        setAllConfigs(data.configs);
      } else {
        console.warn(
          'Unexpected response structure for all configs, but trying to handle gracefully:',
          data
        );
        setAllConfigs([]);
      }
    } catch (err) {
      console.error('Error fetching All configurations:', err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setAllConfigsLoading(false);
    }
  }, []);

  /**
   * Fetches configurations created by the currently authenticated user.
   * Redirects to login if the user is not authenticated.
   */
  const fetchUserConfigs = useCallback(async () => {
    setUserConfigsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/configs/my-configs', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401) {
        router.push('/login');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch User configurations');
      }

      const data = await response.json();
      if (data.configs && Array.isArray(data.configs)) {
        setUserConfigs(data.configs);
      } else if (Array.isArray(data)) {
        setUserConfigs(data);
      } else {
        console.warn('Unexpected response structure for user configs:', data);
        setUserConfigs([]);
      }
    } catch (err) {
      console.error('Error fetching User configurations:', err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setUserConfigsLoading(false);
    }
  }, [router]);

  /**
   * Sets the configuration ID to be deleted and opens the confirmation dialog.
   * @param {string} id - The ID of the configuration to delete.
   */
  const handleDeleteRequest = (id: string) => {
    setConfigToDeleteId(id);
    setShowDeleteConfirm(true);
  };

  /**
   * Confirms and executes the deletion of a configuration.
   * Shows success or error toasts based on the outcome.
   */
  const handleConfirmDelete = async () => {
    if (!configToDeleteId) return;

    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/configs/${configToDeleteId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to delete configuration');
      }

      setUserConfigs((prev) =>
        prev.filter((config) => config.id !== configToDeleteId)
      );
      setAllConfigs((prev) =>
        prev.filter((config) => config.id !== configToDeleteId)
      );

      setShowDeleteConfirm(false);
      showToast({
        title: 'Configuration deleted successfully',
        variant: 'success',
      });
    } catch (err) {
      console.error('Error deleting config:', err);
      const errorMessage =
        err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      showToast({
        title: 'Error Deleting Configuration',
        description: errorMessage,
        variant: 'error',
      });
    } finally {
      setIsDeleting(false);
      setConfigToDeleteId(null);
    }
  };

  /**
   * Generates a shareable URL for a given configuration ID and opens the share dialog.
   * @param {string} id - The ID of the configuration to share.
   */
  const handleShare = (id: string) => {
    const url = new URL(window.location.origin);
    url.pathname = '/playground';
    url.searchParams.set('id', id);
    setShareUrl(url.toString());
    setShareDialogOpen(true);
  };

  const handleCopyUrl = () => {
    navigator.clipboard
      .writeText(shareUrl)
      .then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      })
      .catch((err) => {
        console.error('Failed to copy URL:', err);
        setError('Failed to copy URL to clipboard');
      });
  };

  useEffect(() => {
    fetchAllConfigs();
    fetchUserConfigs();
  }, [fetchAllConfigs, fetchUserConfigs]);

  useEffect(() => {
    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        router.push('/login');
      }
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  return (
    <div className={styles.profileContainer}>
      <Flex direction="column" gap="6">
        {/* Header Section */}
        <Box>
          <Heading size="6" mb="2" data-cy="profile-header">
            <PersonIcon /> Profile
          </Heading>
          <Text size="2" color="gray">
            Manage your account and view your saved animations
          </Text>
        </Box>

        {/* User Information Card */}
        <Card data-cy="profile-info" className={styles.userInfoCard}>
          {isLoading ? (
            <Flex align="center" gap="3">
              <Box className={styles.avatarSkeleton} />
              <Flex direction="column" gap="2">
                <Box className={styles.textSkeleton} />
                <Box className={styles.textSkeleton} style={{ width: '60%' }} />
              </Flex>
            </Flex>
          ) : isAuthenticated && user ? (
            <Flex align="center" gap="4">
              <Avatar
                data-cy="user-avatar"
                src={user.user_metadata?.avatar_url}
                fallback={
                  user.user_metadata?.full_name?.charAt(0)?.toUpperCase() ||
                  user.email?.charAt(0)?.toUpperCase() ||
                  'U'
                }
                size="6"
                radius="full"
              />
              <Flex direction="column" gap="1" style={{ flex: 1 }}>
                <Flex align="center" gap="2">
                  <Text data-cy="user-name" size="5" weight="bold">
                    {user.user_metadata?.full_name || 'Anonymous User'}
                  </Text>
                  <Badge color="green" variant="soft">
                    Active
                  </Badge>
                </Flex>
                <Text data-cy="user-email" size="3" color="gray">
                  {user.email}
                </Text>
                <Text data-cy="member-since" size="2" color="gray">
                  Member since{' '}
                  {new Date(user.created_at).toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </Text>
              </Flex>
            </Flex>
          ) : (
            <Flex align="center" justify="center" py="4">
              <Text color="gray">
                Please log in to view your profile information.
              </Text>
            </Flex>
          )}
        </Card>

        {/* Content Tabs */}
        <Tabs.Root defaultValue="my-configs" className={styles.tabs}>
          <Tabs.List className={styles.tabsList}>
            <Tabs.Trigger
              value="my-configs"
              className={styles.tabsTrigger}
              data-cy="profile-my-configs"
            >
              <ArchiveIcon />
              My Configurations
              {userConfigs.length > 0 && (
                <Badge size="1" color="blue" variant="soft">
                  {userConfigs.length}
                </Badge>
              )}
            </Tabs.Trigger>
            <Tabs.Trigger
              value="all-configs"
              className={styles.tabsTrigger}
              data-cy="profile-all-configs"
            >
              All Configurations
              {allConfigs.length > 0 && (
                <Badge size="1" color="gray" variant="soft">
                  {allConfigs.length}
                </Badge>
              )}
            </Tabs.Trigger>
            <Tabs.Trigger
              value="settings"
              className={styles.tabsTrigger}
              data-cy="profile-settings"
            >
              <GearIcon />
              Settings
            </Tabs.Trigger>
          </Tabs.List>

          <Box pt="4">
            <Tabs.Content value="my-configs" data-cy="saved-configurations">
              <Card>
                <Flex direction="column" gap="4">
                  <Flex align="center" justify="between">
                    <Heading size="4">Your Saved Configurations</Heading>
                    <Text data-cy="configurations-count" size="2" color="gray">
                      {userConfigsLoading
                        ? 'Loading...'
                        : `${userConfigs.length} saved configurations`}
                    </Text>
                  </Flex>
                  <Separator />
                  <ConfigList
                    configs={userConfigs}
                    loading={userConfigsLoading}
                    error={error}
                    emptyStateMessage="You don't have any saved configurations yet."
                    loadingLabel="Loading your configurations…"
                    onRetry={fetchUserConfigs}
                    onDeleteAction={handleDeleteRequest}
                    onShareAction={handleShare}
                    emptyStateAction={
                      <Button
                        onClick={() => router.push('/playground')}
                        size="3"
                      >
                        Create Your First Animation
                      </Button>
                    }
                  />
                </Flex>
              </Card>
            </Tabs.Content>

            <Tabs.Content value="all-configs">
              <Card>
                <Flex direction="column" gap="4">
                  <Flex align="center" justify="between">
                    <Heading size="4">Community Configurations</Heading>
                    <Text data-cy="configurations-count" size="2" color="gray">
                      {allConfigsLoading
                        ? 'Loading...'
                        : `${allConfigs.length} configurations found`}
                    </Text>
                  </Flex>
                  <Separator />
                  <ConfigList
                    configs={allConfigs}
                    loading={allConfigsLoading}
                    error={error}
                    emptyStateMessage="No configurations found yet 😢 — be the first to share!"
                    loadingLabel="Loading all configurations…"
                    onRetry={fetchAllConfigs}
                    onShareAction={handleShare}
                    emptyStateAction={
                      <Button
                        onClick={() => router.push('/playground')}
                        size="3"
                      >
                        Create Your First Animation
                      </Button>
                    }
                  />
                </Flex>
              </Card>
            </Tabs.Content>

            <Tabs.Content value="settings" data-cy="profile-settings">
              <Card>
                <Flex direction="column" gap="4">
                  <Heading size="4">
                    <GearIcon /> Profile Settings
                  </Heading>
                  <Separator />
                  <Flex direction="column" gap="3" py="4">
                    <Text size="3" color="gray">
                      Profile settings and preferences will be available here in
                      a future update.
                    </Text>
                    <Text size="2" color="gray">
                      Coming soon: theme preferences, notification settings, and
                      more!
                    </Text>
                  </Flex>
                </Flex>
              </Card>
            </Tabs.Content>
          </Box>
        </Tabs.Root>
      </Flex>

      <Dialog.Root open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <Dialog.Content style={{ maxWidth: 450 }}>
          <Dialog.Title>Share Animation Configuration</Dialog.Title>
          <Dialog.Description>
            Anyone with this link can view and use this animation configuration.
          </Dialog.Description>

          <Flex direction="column" gap="3" mt="4">
            <Text size="2" weight="medium" color="gray">
              Share URL:
            </Text>
            <Flex gap="2">
              <Box style={{ flex: 1 }}>
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className={styles.shareInput}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--gray-6)',
                    borderRadius: '6px',
                    backgroundColor: 'var(--gray-2)',
                    fontSize: '0.875rem',
                    fontFamily: 'var(--default-font-family)',
                  }}
                />
              </Box>
              <Button
                onClick={handleCopyUrl}
                variant={copySuccess ? 'solid' : 'outline'}
                color={copySuccess ? 'green' : 'gray'}
                style={{ minWidth: '80px' }}
              >
                <CopyIcon />
                {copySuccess ? 'Copied!' : 'Copy'}
              </Button>
            </Flex>

            {copySuccess && (
              <Text color="green" size="2">
                ✓ Link copied to clipboard!
              </Text>
            )}
          </Flex>

          <Flex gap="3" mt="6" justify="end">
            <Dialog.Close>
              <Button variant="soft" color="gray">
                Close
              </Button>
            </Dialog.Close>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>

      <AlertNotification
        showAlert={showDeleteConfirm}
        setShowAlert={setShowDeleteConfirm}
        alertTitle="Confirm Deletion"
        alertMessage={`Are you sure you want to delete the configuration: ${userConfigs.find((c) => c.id === configToDeleteId)?.title ?? ''}? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        confirmButtonText={isDeleting ? 'Deleting...' : 'Delete'}
      />
    </div>
  );
}
