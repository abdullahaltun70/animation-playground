// src/components/config-panel/VisibilitySwitch.tsx
import React from 'react';

import { EyeOpenIcon, LockClosedIcon } from '@radix-ui/react-icons';
import { Flex, SegmentedControl, Text } from '@radix-ui/themes';

interface VisibilitySwitchProps {
	/** The current visibility state (true for Public, false for Private) */
	isPublic: boolean;
	/** Callback function when the visibility changes */
	onChange: (isPublic: boolean) => void;
	/** Whether the switch should be disabled */
	disabled?: boolean;
}

export function VisibilitySwitch({
	isPublic,
	onChange,
	disabled = false,
}: VisibilitySwitchProps) {
	// Determine the value for the SegmentedControl based on the isPublic prop
	const currentValue = isPublic ? 'public' : 'private';

	// Handler for when the SegmentedControl value changes
	const handleValueChange = (value: string) => {
		// Convert the string value back to a boolean and call the onChange prop
		onChange(value === 'public');
	};

	return (
		// Use SegmentedControl.Root to wrap the options
		<SegmentedControl.Root
			value={currentValue}
			onValueChange={handleValueChange}
			disabled={disabled}
			radius="full" // Makes the ends fully rounded like a pill
			// Optional: Prevent stretching if needed
			style={{ width: 'fit-content' }}
		>
			{/* Private Option */}
			<SegmentedControl.Item value="private">
				<Flex gap="2" align="center">
					{' '}
					{/* Use Flex to layout icon and text */}
					<LockClosedIcon width="16" height="16" />
					<Text size="2">Private</Text>
				</Flex>
			</SegmentedControl.Item>

			{/* Public Option */}
			<SegmentedControl.Item value="public">
				<Flex gap="2" align="center">
					{' '}
					{/* Use Flex to layout icon and text */}
					<EyeOpenIcon width="16" height="16" />
					<Text size="2">Public</Text>
				</Flex>
			</SegmentedControl.Item>
		</SegmentedControl.Root>
	);
}
