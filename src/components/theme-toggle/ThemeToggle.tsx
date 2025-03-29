// src/components/theme-toggle/ThemeToggle.tsx
import React, { useState, useEffect } from 'react';

import { MoonIcon, SunIcon, DesktopIcon } from '@radix-ui/react-icons';
import { IconButton, DropdownMenu, Tooltip } from '@radix-ui/themes';
import { useTheme } from 'next-themes';

export const ThemeToggle = () => {
	const { theme, setTheme, resolvedTheme } = useTheme();
	// We need mounted state to avoid hydration mismatch,
	// because theme is initially undefined on the server.
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	// Render placeholder or null until mounted
	if (!mounted) {
		// Optional: Render a placeholder skeleton or similar
		return (
			<IconButton variant="ghost" disabled>
				<DesktopIcon width="18" height="18" />
			</IconButton>
		);
	}

	const ThemeIcon = () => {
		if (theme === 'light') return <SunIcon width="18" height="18" />;
		if (theme === 'dark') return <MoonIcon width="18" height="18" />;
		// For 'system', show the resolved theme icon or a generic one
		// resolvedTheme gives 'light' or 'dark' based on system pref
		if (resolvedTheme === 'light') return <SunIcon width="18" height="18" />;
		if (resolvedTheme === 'dark') return <MoonIcon width="18" height="18" />;
		// Fallback if resolution hasn't happened yet or for system itself
		return <DesktopIcon width="18" height="18" />;
	};

	const getCurrentThemeName = () => {
		switch (theme) {
			case 'light':
				return 'Light';
			case 'dark':
				return 'Dark';
			case 'system':
				return 'System';
			default:
				return 'System';
		}
	};

	return (
		<DropdownMenu.Root>
			<Tooltip content={`Theme: ${getCurrentThemeName()}`}>
				<DropdownMenu.Trigger>
					<IconButton variant="ghost" aria-label="Toggle theme">
						<ThemeIcon />
					</IconButton>
				</DropdownMenu.Trigger>
			</Tooltip>

			<DropdownMenu.Content align="end">
				<DropdownMenu.RadioGroup value={theme} onValueChange={setTheme}>
					<DropdownMenu.RadioItem value="light">
						<SunIcon width="16" height="16" style={{ marginRight: '8px' }} />
						Light
					</DropdownMenu.RadioItem>
					<DropdownMenu.RadioItem value="dark">
						<MoonIcon width="16" height="16" style={{ marginRight: '8px' }} />
						Dark
					</DropdownMenu.RadioItem>
					<DropdownMenu.RadioItem value="system">
						<DesktopIcon
							width="16"
							height="16"
							style={{ marginRight: '8px' }}
						/>
						System
					</DropdownMenu.RadioItem>
				</DropdownMenu.RadioGroup>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	);
};
