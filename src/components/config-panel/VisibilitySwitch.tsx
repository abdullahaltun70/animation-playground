import React from 'react';

import { EyeOpenIcon, LockClosedIcon } from '@radix-ui/react-icons';
import { Flex, SegmentedControl, Text } from '@radix-ui/themes';

import styles from './VisibilitySwitch.module.scss';

/**
 * @interface VisibilitySwitchProps
 * @description Defines the props for the VisibilitySwitch component.
 * @property {boolean} isPublic - Indicates if the current state is public.
 * @property {(isPublic: boolean) => void} onChange - Callback function triggered when the visibility state changes.
 * @property {boolean} [disabled=false] - Optional flag to disable the control.
 * @property {string} ['aria-label'] - Optional aria-label for accessibility.
 */
interface VisibilitySwitchProps {
  isPublic: boolean;
  onChange: (isPublic: boolean) => void;
  disabled?: boolean;
  'aria-label'?: string;
}

/**
 * @component VisibilitySwitch
 * @description A segmented control component for toggling visibility between public and private states.
 * It utilizes Radix UI's SegmentedControl, Flex, and Text components, along with custom icons.
 * @param {VisibilitySwitchProps} props - The props for the component.
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
    // SegmentedControl provides a clear visual choice between "Private" and "Public".
    <SegmentedControl.Root
      value={currentValue}
      onValueChange={handleValueChange}
      disabled={disabled}
      radius="full"
      style={{ width: 'fit-content' }}
      className={styles.visibilitySwitchRoot}
      aria-label={ariaLabel}
    >
      <SegmentedControl.Item value="private">
        <Flex gap="2" align="center" title="Set visibility to Private">
          <LockClosedIcon
            width="16"
            height="16"
            color="var(--red-11)" // Icon color for private state
          />
          <Text size="2">Private</Text>
        </Flex>
      </SegmentedControl.Item>

      <SegmentedControl.Item value="public">
        <Flex gap="2" align="center" title="Set visibility to Public">
          <EyeOpenIcon width="16" height="16" color="var(--accent-9)" />
          <Text size="2">Public</Text>
        </Flex>
      </SegmentedControl.Item>
    </SegmentedControl.Root>
  );
}
