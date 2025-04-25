import React from 'react';

import { Box, Button, Flex, Text } from '@radix-ui/themes';

import { ConfigCard } from '@/components/config-card/ConfigCard';
import { ConfigModel } from '@/types/animations';

import styles from '../styles/ConfigList.module.scss';

/* ------------------------------------------------------------------ */
/*  TYPES                                                             */
/* ------------------------------------------------------------------ */
export interface ConfigListProps {
  /* data */
  configs: ConfigModel[];
  loading: boolean;
  error: string | null;

  /* UX strings */
  emptyStateMessage: string;
  loadingLabel?: string;

  /* callbacks */
  onRetry: () => void;
  onDeleteAction?: (id: string) => void;
  onShareAction: (id: string) => void;

  /* misc */
  authorName?: string;
  /**
   * Optional element shown under empty‑state text (e.g. “Create first animation” button).
   * Useful so the parent decides navigation logic.
   */
  emptyStateAction?: React.ReactNode;
}

/* ------------------------------------------------------------------ */
/*  COMPONENT                                                         */
/* ------------------------------------------------------------------ */
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
        {error}
        <Button onClick={onRetry} ml="3">
          Retry
        </Button>
      </Box>
    );
  }

  if (loading) {
    return (
      <Flex direction="column" gap="3">
        <Text mb="2">{loadingLabel}</Text>
        <ConfigCardSkeleton />
        <ConfigCardSkeleton />
        <ConfigCardSkeleton />
      </Flex>
    );
  }

  if (configs.length === 0) {
    return (
      <Box className={styles.emptyState}>
        <Text size="3">{emptyStateMessage}</Text>
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
          onDeleteAction={onDeleteAction}
          onShareAction={onShareAction}
          authorName={cfg.authorName || 'Unknown User'}
        />
      ))}
    </Flex>
  );
};

export default ConfigList;

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
      />{' '}
      {/* Title */}
      <div
        className={styles.skeletonBar}
        style={{ height: '16px', width: '90%' }}
      />{' '}
      {/* Description line 1 */}
      <div
        className={styles.skeletonBar}
        style={{ height: '16px', width: '80%' }}
      />{' '}
      {/* Description line 2 */}
      <div
        className={styles.skeletonBar}
        style={{ height: '16px', width: '40%' }}
      />{' '}
      {/* Meta info */}
      <Flex justify="end" gap="2" mt="3">
        <div
          className={styles.skeletonBar}
          style={{ height: '32px', width: '70px' }}
        />{' '}
        {/* Button */}
        <div
          className={styles.skeletonBar}
          style={{ height: '32px', width: '70px' }}
        />{' '}
        {/* Button */}
      </Flex>
    </Flex>
  </Box>
);
