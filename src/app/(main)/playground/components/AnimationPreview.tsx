import React from 'react';

import { CodeIcon, Share1Icon } from '@radix-ui/react-icons';
import { Box, Button, Flex } from '@radix-ui/themes';

import { AnimatedContainer } from '@/components/animated-container/AnimatedContainer';
import { AnimationConfig } from '@/types/animations';

import styles from '../styles/Playground.module.scss';

/**
 * @interface AnimationPreviewProps
 * @description Defines the props for the AnimationPreview component.
 * @property {AnimationConfig} config - The current animation configuration to be previewed.
 * @property {string | null} configId - The ID of the current configuration, if saved. Used to determine if sharing is possible.
 * @property {() => void} onShare - Callback function invoked when the share button is clicked.
 * @property {() => void} onExport - Callback function invoked when the export button is clicked.
 */
interface AnimationPreviewProps {
  config: AnimationConfig;
  configId: string | null;
  onShare: () => void;
  onExport: () => void;
}

/**
 * @component AnimationPreview
 * @description Displays the animation preview using the `AnimatedContainer` component
 * and provides action buttons for sharing (if `configId` is present) and exporting the animation.
 * @param {AnimationPreviewProps} props - The props for the component.
 */
export function AnimationPreview({
  config,
  configId,
  onShare,
  onExport,
}: AnimationPreviewProps) {
  return (
    <Box className={styles.animationArea} data-cy="animation-preview">
      <AnimatedContainer config={config} data-cy="animation-preview-element" />

      <Flex className={styles.actionButtons} gap="2">
        {configId && ( // Share button is only rendered if there's a configId (i.e., config is saved)
          <Button onClick={onShare} data-cy="share-btn">
            <Share1Icon /> Share
          </Button>
        )}
        <Button onClick={onExport} data-cy="export-btn">
          <CodeIcon /> Export Code
        </Button>
      </Flex>
    </Box>
  );
}
