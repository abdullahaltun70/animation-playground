// src/components/theme-toggle/ThemeToggle.tsx
'use client';

import React, { useEffect, useState } from 'react';

import { MoonIcon, SunIcon } from '@radix-ui/react-icons';
import { IconButton, Tooltip } from '@radix-ui/themes';
import { useTheme } from 'next-themes';

export const ThemeToggle = () => {
	const { theme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	// Wait until component has mounted to avoid hydration mismatch
	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		// Return a placeholder with same structure but no theme-dependent content
		return <IconButton variant="ghost" aria-label="Toggle Dark Mode" />;
	}

	return (
		<Tooltip
			delayDuration={0}
			side={'right'}
			content={theme === 'dark' ? 'Light mode' : 'Dark mode'}
		>
			<IconButton
				variant="ghost"
				onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
				aria-label="Toggle Dark Mode"
			>
				{theme === 'dark' ? (
					<SunIcon style={{ width: '24px', height: '24px' }} />
				) : (
					<MoonIcon style={{ width: '24px', height: '24px' }} />
				)}
			</IconButton>
		</Tooltip>
	);
};
