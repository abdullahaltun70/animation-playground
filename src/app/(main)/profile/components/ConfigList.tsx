import React from 'react';

import { Box, Button, Flex, Text } from '@radix-ui/themes';

import { ConfigCard } from '@/components/config-card/ConfigCard';
import { ConfigModel } from '@/types/animations';

import styles from '../styles/ConfigList.module.scss';

/* ------------------------------------------------------------------ */
/*  TYPES                                                             */
/* ------------------------------------------------------------------ */
export interface ConfigListProps {
  /** Animation configurations to display. */
  configs: ConfigModel[];
  /** Loading state indicator. */
  loading: boolean;
  /** Error message, if any. */
  error: string | null;

  /** Message to display when no configurations are found. */
  emptyStateMessage: string;
  /** Label for the loading state. Defaults to "Loading…". */
  loadingLabel?: string;

  /** Callback function to retry fetching configurations. */
  onRetry: () => void;
  /** Optional callback for deleting a configuration. */
  onDeleteAction?: (id: string) => void;
  /** Callback for sharing a configuration. */
  onShareAction: (id: string) => void;

  /** Optional author name to display (currently not used directly in this component but passed to ConfigCard). */
  authorName?: string;
  /**
   * Optional React node to display as an action in the empty state.
   * Example: A button to navigate to the playground to create a new animation.
   */
  emptyStateAction?: React.ReactNode;
}

/* ------------------------------------------------------------------ */
/*  COMPONENT                                                         */
/* ------------------------------------------------------------------ */
/**
 * `ConfigList` is a React functional component that displays a list of animation configurations.
 * It handles loading states, error messages, and an empty state.
 * Each configuration is rendered using the `ConfigCard` component.
 * It also provides actions like retrying a failed fetch, deleting, and sharing configurations.
 */
export const ConfigList: React.FC<ConfigListProps> = ({
  configs,
  loading,
  error,

  emptyStateMessage,
  loadingLabel = 'Loading…',

  onRetry,
  onDeleteAction,
  onShareAction,

  emptyStateAction,
}) => {
  /* ---------------------------- render --------------------------- */
  if (error) {
    return (
      <Box className={styles.errorMessage}>
        <Text color="red" mr="3">
          Error: {error}
        </Text>
        <Button onClick={onRetry}>Retry</Button>
      </Box>
    );
  }

  if (loading) {
    return (
      <Flex direction="column" gap="3">
        <Text mb="2">{loadingLabel}</Text>
        {/* Render multiple skeletons for a better loading preview */}
        {[...Array(3)].map((_, index) => (
          <ConfigCardSkeleton key={index} />
        ))}
      </Flex>
    );
  }

  if (configs.length === 0) {
    return (
      <Box className={styles.emptyState} p="4" style={{ textAlign: 'center' }}>
        <Text size="3" color="gray">
          {emptyStateMessage}
        </Text>
        {emptyStateAction && <Box mt="3">{emptyStateAction}</Box>}
      </Box>
    );
  }

  return (
    <Flex direction="column" gap="3">
      {configs.map((cfg) => (
        <ConfigCard
          key={cfg.id}
          config={cfg}
          onDeleteAction={onDeleteAction} // Pass down the delete handler
          onShareAction={onShareAction} // Pass down the share handler
          authorName={cfg.authorName || 'Unknown User'} // Use authorName from individual config, fallback if needed
        />
      ))}
    </Flex>
  );
};

export default ConfigList;

/**
 * `ConfigCardSkeleton` is a React functional component that renders a skeleton placeholder
 * for a `ConfigCard`. This is used to indicate loading content before the actual data is available.
 */
const ConfigCardSkeleton = () => (
  <Box
    p="4"
    style={{
      border: '1px solid var(--gray-a5)',
      borderRadius: 'var(--radius-3)',
    }}
  >
    <Flex direction="column" gap="3">
      <div
        className={styles.skeletonBar}
        style={{ height: '24px', width: '60%' }}
      />
      {/* Title */}
      <div
        className={styles.skeletonBar}
        style={{ height: '16px', width: '90%' }}
      />
      {/* Description line 1 */}
      <div
        className={styles.skeletonBar}
        style={{ height: '16px', width: '80%' }}
      />
      {/* Description line 2 */}
      <div
        className={styles.skeletonBar}
        style={{ height: '16px', width: '40%' }}
      />
      {/* Meta info */}
      <Flex justify="end" gap="2" mt="3">
        <div
          className={styles.skeletonBar}
          style={{ height: '32px', width: '70px' }}
        />
        {/* Button */}
        <div
          className={styles.skeletonBar}
          style={{ height: '32px', width: '70px' }}
        />
        {/* Button */}
      </Flex>
    </Flex>
  </Box>
);
