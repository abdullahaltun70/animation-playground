// src/components/config-panel/VisibilitySwitch.tsx
import React from 'react';

import { EyeOpenIcon, LockClosedIcon } from '@radix-ui/react-icons';
import { Flex, SegmentedControl, Text } from '@radix-ui/themes';

import styles from './VisibilitySwitch.module.scss';

interface VisibilitySwitchProps {
	isPublic: boolean;
	onChange: (isPublic: boolean) => void;
	disabled?: boolean;
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
			radius="full" // Keep the familiar rounded pill shape
			// We'll stick with the default `variant="surface"` as it provides clear active state
			// variant="surface"
			// Keep the control compact horizontally
			style={{ width: 'fit-content' }}
			className={styles.visibilitySwitchRoot}
		>
			{/* Private Option */}
			<SegmentedControl.Item
				value="private"
				className={styles.privateOptionStyle}
			>
				<Flex gap="2" align="center" title="Set visibility to Private">
					<LockClosedIcon
						width="16"
						height="16"
						// Subtle Enhancement: Use a neutral gray for the lock icon always.
						// This provides a consistent visual cue for 'private/secure'.
						// `var(--gray-11)` offers good visibility in both light/dark modes.
						color="var(--red-11)"
					/>
					{/* Using standard Text size for consistency */}
					<Text size="2">Private</Text>
				</Flex>
			</SegmentedControl.Item>

			{/* Public Option */}
			<SegmentedControl.Item value="public">
				<Flex gap="2" align="center" title="Set visibility to Public">
					<EyeOpenIcon
						width="16"
						height="16"
						// Subtle Enhancement: Use the theme's primary accent color for the eye icon always.
						// This visually associates 'public/visible' with the theme's highlight color.
						// `var(--accent-9)` is the main interactive shade used for backgrounds/borders.
						color="var(--accent-9)"
					/>
					<Text size="2">Public</Text>
				</Flex>
			</SegmentedControl.Item>
		</SegmentedControl.Root>
	);
}
