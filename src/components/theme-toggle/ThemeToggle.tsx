// src/components/theme-toggle/ThemeToggle.tsx
import React, { useState, useEffect } from 'react';

import { MoonIcon, SunIcon, DesktopIcon } from '@radix-ui/react-icons';
import { IconButton, DropdownMenu, Tooltip } from '@radix-ui/themes';
import { useTheme } from 'next-themes';

/**
 * @component ThemeToggle
 * @description A component that allows the user to toggle between light, dark, and system themes.
 * It uses `next-themes` for theme management and handles potential hydration mismatches
 * by ensuring it's mounted on the client before rendering the interactive parts.
 * This component does not accept any props.
 */
export const ThemeToggle = () => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  // mounted state is used to avoid hydration mismatch, as theme is initially undefined on the server.
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Render a disabled placeholder until the component is mounted on the client.
  if (!mounted) {
    return (
      <IconButton variant="ghost" disabled>
        <DesktopIcon width="18" height="18" />
      </IconButton>
    );
  }

  // Determines the icon to display based on the current (and resolved) theme.
  const ThemeIcon = () => {
    if (theme === 'light') return <SunIcon width="18" height="18" />;
    if (theme === 'dark') return <MoonIcon width="18" height="18" />;
    // For 'system' theme, the icon reflects the currently resolved system preference (light/dark).
    if (resolvedTheme === 'light') return <SunIcon width="18" height="18" />;
    if (resolvedTheme === 'dark') return <MoonIcon width="18" height="18" />;
    return <DesktopIcon width="18" height="18" />; // Fallback or if theme is 'system' and not yet resolved
  };

  // Gets a user-friendly name for the current theme selection.
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
