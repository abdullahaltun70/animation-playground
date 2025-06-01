'use client';

import React from 'react';

import {
  CalendarIcon,
  PersonIcon,
  EyeOpenIcon,
  LockClosedIcon,
  TrashIcon,
  Share1Icon,
  Pencil2Icon,
} from '@radix-ui/react-icons';
import { Box, Button, Flex, Text } from '@radix-ui/themes';
import { useRouter } from 'next/navigation';

import { ConfigModel } from '@/types/animations';

import styles from './ConfigCard.module.scss';

/**
 * @interface ConfigCardProps
 * @description Defines the props for the ConfigCard component.
 * @property {ConfigModel} config - The configuration data object to display.
 * @property {(id: string) => void} [onDeleteAction] - Optional callback function to handle delete action.
 * @property {(id: string) => void} [onShareAction] - Optional callback function to handle share action.
 * @property {string} authorName - The name of the configuration's author.
 */
interface ConfigCardProps {
  config: ConfigModel;
  onDeleteAction?: (id: string) => void;
  onShareAction?: (id: string) => void;
  authorName: string;
}

/**
 * @component ConfigCard
 * @description A card component to display information about an animation configuration,
 * including its title, description, metadata (creation date, author, visibility),
 * and action buttons for edit, share, and delete.
 * @param {ConfigCardProps} props - The props for the component.
 */
export function ConfigCard({
  config,
  onDeleteAction,
  onShareAction,
  authorName,
}: ConfigCardProps) {
  const router = useRouter();

  const handleShare = () => {
    if (onShareAction) {
      onShareAction(config.id);
    }
  };

  const handleEdit = () => {
    router.push(`/playground?id=${config.id}`);
  };

  /**
   * @function formatDate
   * @description Formats a date string into a more readable format (e.g., "Jan 1, 2023").
   * Handles potential errors with invalid date strings.
   * @param {string} dateString - The date string to format.
   * @returns {string} The formatted date string or "Invalid Date" on error.
   */
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        // Basic check for invalid date
        return 'Invalid Date';
      }
      return date.toLocaleDateString(undefined, {
        // Use locale-specific date format
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (e) {
      console.error('Error formatting date:', dateString, e);
      return 'Invalid Date';
    }
  };

  return (
    <Box className={styles.configCard} p="4">
      <Flex direction="column" gap="2">
        <Text size="5" weight="bold">
          {config.title || 'Untitled Configuration'}
        </Text>
        <Text className={styles.description}>
          {config.description || 'No description provided.'}
        </Text>

        <Flex gap="2" direction="row" align="center" wrap="wrap">
          {' '}
          {/* Added wrap for responsiveness */}
          <Flex gap="1" align="center">
            <CalendarIcon />
            <Text size="1" className={styles.metaText}>
              {formatDate(config.createdAt)}
            </Text>
          </Flex>
          <Flex align="center" gap="1">
            <PersonIcon />
            <Text size="1" className={styles.metaText}>
              @{authorName || 'Unknown User'}
            </Text>
          </Flex>
          <Flex gap="1" direction="row" align="center">
            {config.isPublic ? (
              <>
                <EyeOpenIcon color="var(--accent-9)" />
                <Text size="1" className={styles.metaText}>
                  Public
                </Text>
              </>
            ) : (
              <>
                <LockClosedIcon color="var(--red-11)" />
                <Text size="1" className={styles.metaText}>
                  Private
                </Text>
              </>
            )}
          </Flex>
        </Flex>

        <Flex mt="3" gap="2" justify="end">
          {onDeleteAction && (
            <Button
              variant="soft"
              color="red"
              onClick={() => onDeleteAction(config.id)}
              size="1"
              data-cy="delete-config-button"
            >
              <TrashIcon /> Delete
            </Button>
          )}
          {onShareAction && (
            <Button variant="soft" onClick={handleShare} size="1">
              <Share1Icon /> Share
            </Button>
          )}
          <Button variant="soft" onClick={handleEdit} size="1">
            <Pencil2Icon /> Edit
          </Button>
        </Flex>
      </Flex>
    </Box>
  );
}
