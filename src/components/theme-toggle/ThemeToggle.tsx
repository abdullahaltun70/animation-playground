import React from 'react';

import { MoonIcon, SunIcon } from '@radix-ui/react-icons';
import { IconButton, Tooltip } from '@radix-ui/themes';
import { useTheme } from 'next-themes';

export const ThemeToggle = () => {
	const { theme, setTheme } = useTheme();

	return (
		<Tooltip content={theme === 'dark' ? 'Light mode' : 'Dark mode'}>
			<IconButton
				variant="ghost"
				onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
				aria-label="Toggle Dark Mode"
			>
				{theme === 'dark' ? (
					<SunIcon className="w-6 h-6 text-yellow-500" />
				) : (
					<MoonIcon className="w-6 h-6 text-gray-800" />
				)}
			</IconButton>
		</Tooltip>
	);
};
