import React from 'react';

import { Box, Card, Flex, Tabs, Skeleton } from '@radix-ui/themes';

// Assuming a similar style path might exist or using a generic approach for styling.
// If ProfilePage.module.scss is specific to (main), this might need adjustment
// or inline styles / Radix props for styling.
// For now, let's assume a generic class name if styles were to be applied.
// const styles = { profilePageContainer: 'profilePageContainer', configCardSkeleton: 'configCardSkeleton' };

/**
 * @component ProfileLoading
 * @description Provides a skeleton loading UI for the Profile page,
 * mimicking its tab structure and card lists. This is used as a route-level
 * loading component by Next.js Suspense.
 */
export default function ProfileLoading() {
  const SkeletonCard = () => (
    <Card /* className={styles.configCardSkeleton} */>
      <Skeleton height="24px" width="70%" mb="2" />
      <Skeleton height="16px" width="90%" mb="3" />
      <Flex gap="2" direction="row" align="center" wrap="wrap" mb="3">
        <Skeleton height="14px" width="100px" />
        <Skeleton height="14px" width="120px" />
        <Skeleton height="14px" width="70px" />
      </Flex>
      <Flex mt="3" gap="2" justify="end">
        <Skeleton height="32px" width="80px" />
        <Skeleton height="32px" width="80px" />
      </Flex>
    </Card>
  );

  return (
    <Box /* className={styles.profilePageContainer} */ p="4">
      <Tabs.Root defaultValue="my-configs">
        <Tabs.List size="2" mb="4">
          <Tabs.Trigger value="my-configs">My Configurations</Tabs.Trigger>
          <Tabs.Trigger value="all-configs">All Configurations</Tabs.Trigger>
        </Tabs.List>

        <Box>
          <Tabs.Content value="my-configs">
            <Flex direction="column" gap="3">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </Flex>
          </Tabs.Content>

          <Tabs.Content value="all-configs">
            {/* Kept distinct for clarity, though content is same for skeleton */}
            <Flex direction="column" gap="3">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </Flex>
          </Tabs.Content>
        </Box>
      </Tabs.Root>
    </Box>
  );
}
