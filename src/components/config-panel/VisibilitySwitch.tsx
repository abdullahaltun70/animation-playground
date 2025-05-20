// src/components/config-panel/VisibilitySwitch.tsx
import React from 'react';

import { EyeOpenIcon, LockClosedIcon } from '@radix-ui/react-icons';
import { Flex, SegmentedControl, Text } from '@radix-ui/themes';

import styles from './VisibilitySwitch.module.scss';

interface VisibilitySwitchProps {
  isPublic: boolean;
  onChange: (isPublic: boolean) => void;
  disabled?: boolean;
  'aria-label'?: string;
}

/**
 * A segmented control component for toggling visibility between public and private states.
 * Uses Radix UI components with themed icons and consistent styling.
 * @param isPublic - Boolean flag indicating if the current state is public
 * @param onChange - Callback function triggered when visibility state changes
 * @param disabled - Optional flag to disable the control
 */
export function VisibilitySwitch({
  isPublic,
  onChange,
  disabled = false,
  'aria-label': ariaLabel,
}: VisibilitySwitchProps) {
  const currentValue = isPublic ? 'public' : 'private';

  const handleValueChange = (value: string) => {
    onChange(value === 'public');
  };

  return (
    // Using SegmentedControl for clear choice presentation
    <SegmentedControl.Root
      value={currentValue}
      onValueChange={handleValueChange}
      disabled={disabled}
      radius="full"
      style={{ width: 'fit-content' }}
      className={styles.visibilitySwitchRoot}
      aria-label={ariaLabel}
    >
      {/* Private Option */}
      <SegmentedControl.Item value="private">
        <Flex gap="2" align="center" title="Set visibility to Private">
          <LockClosedIcon
            width="16"
            height="16"
            // color="var(--gray-11)"
            color="var(--red-11)"
          />
          <Text size="2">Private</Text>
        </Flex>
      </SegmentedControl.Item>

      {/* Public Option */}
      <SegmentedControl.Item value="public">
        <Flex gap="2" align="center" title="Set visibility to Public">
          <EyeOpenIcon width="16" height="16" color="var(--accent-9)" />
          <Text size="2">Public</Text>
        </Flex>
      </SegmentedControl.Item>
    </SegmentedControl.Root>
  );
}
