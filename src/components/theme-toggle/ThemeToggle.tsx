// components/theme/ThemeToggle.tsx
import React from 'react';
import { IconButton, Tooltip } from '@radix-ui/themes';
import { SunIcon, MoonIcon } from '@radix-ui/react-icons';
import { useTheme } from 'next-themes';
import styles from './ThemeToggle.module.scss';

export const ThemeToggle = () => {
	const { theme, setTheme } = useTheme();
	const [mounted, setMounted] = React.useState(false);

	// To avoid hydration mismatch, only render after client-side mounting
	React.useEffect(() => setMounted(true), []);

	// Apply a nice fade-in when switching themes
	const handleToggle = () => {
		setTheme(theme === 'dark' ? 'light' : 'dark');
	};

	if (!mounted) return <div className={styles.placeholder} />;

	return (
		<Tooltip content={theme === 'dark' ? 'Light mode' : 'Dark mode'}>
			<IconButton
				variant="ghost"
				className={`${styles.toggleButton} fade-in`}
				onClick={handleToggle}
				aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
			>
				{theme === 'dark' ? (
					<SunIcon width="18" height="18" />
				) : (
					<MoonIcon width="18" height="18" />
				)}
			</IconButton>
		</Tooltip>
	);
};
