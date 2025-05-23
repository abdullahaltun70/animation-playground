import React from 'react';

import { Theme } from '@radix-ui/themes';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';

import { ThemeToggle } from '@/components/theme-toggle/ThemeToggle';

// Mock next-themes
const mockSetTheme = vi.fn();
const mockUseTheme = vi.fn();

vi.mock('next-themes', () => ({
  useTheme: () => mockUseTheme(),
}));

// Mock Radix Icons
vi.mock('@radix-ui/react-icons', async (importOriginal) => {
  const original =
    await importOriginal<typeof import('@radix-ui/react-icons')>();
  return {
    ...original,
    SunIcon: () => <svg data-testid="icon-sun" />,
    MoonIcon: () => <svg data-testid="icon-moon" />,
    DesktopIcon: () => <svg data-testid="icon-desktop" />,
  };
});

describe('ThemeToggle Component', () => {
  const user = userEvent.setup();

  const setupMocks = (theme: string, resolvedTheme: string) => {
    mockUseTheme.mockReturnValue({
      theme,
      setTheme: mockSetTheme,
      resolvedTheme,
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock return, can be overridden in tests
    setupMocks('system', 'light');
    // Simulate component is mounted to avoid returning null/placeholder from ThemeToggle
    // The ThemeToggle component has an internal `mounted` state.
    // We need to ensure tests run as if it's mounted.
    // For functional components, this typically means the useEffect for setMounted(true) has run.
    // Vitest runs in JSDOM, useEffects run.
  });

  const renderThemeToggle = () => {
    // Re-render with current mock values to ensure `useTheme` returns the latest
    const { rerender } = render(
      <Theme>
        <ThemeToggle />
      </Theme>
    );
    return {
      rerender: () =>
        rerender(
          <Theme>
            <ThemeToggle />
          </Theme>
        ),
    };
  };

  describe('Icon Rendering based on Theme', () => {
    it('should display SunIcon when theme is "light"', async () => {
      setupMocks('light', 'light');
      renderThemeToggle();
      // Wait for the component to potentially re-render after mount/theme update
      await waitFor(() =>
        expect(screen.getByTestId('icon-sun')).toBeInTheDocument()
      );
    });

    it('should display MoonIcon when theme is "dark"', async () => {
      setupMocks('dark', 'dark');
      renderThemeToggle();
      await waitFor(() =>
        expect(screen.getByTestId('icon-moon')).toBeInTheDocument()
      );
    });

    it('should display SunIcon when theme is "system" and resolvedTheme is "light"', async () => {
      setupMocks('system', 'light');
      renderThemeToggle();
      await waitFor(() =>
        expect(screen.getByTestId('icon-sun')).toBeInTheDocument()
      );
    });

    it('should display MoonIcon when theme is "system" and resolvedTheme is "dark"', async () => {
      setupMocks('system', 'dark');
      renderThemeToggle();
      await waitFor(() =>
        expect(screen.getByTestId('icon-moon')).toBeInTheDocument()
      );
    });

    it('should display DesktopIcon if theme is "system" and resolvedTheme is not yet determined (or unknown)', async () => {
      setupMocks('system', ''); // Simulate resolvedTheme not yet known
      renderThemeToggle();
      // The component's logic for ThemeIcon has a fallback to DesktopIcon if resolvedTheme isn't light/dark
      await waitFor(() =>
        expect(screen.getByTestId('icon-desktop')).toBeInTheDocument()
      );
    });
  });

  describe('Interaction and Theme Setting', () => {
    it('should open dropdown menu on button click', async () => {
      setupMocks('light', 'light');
      renderThemeToggle();
      // The trigger is an IconButton which has a role of 'button'
      const toggleButton = screen.getByRole('button', {
        name: /toggle theme/i,
      });
      await user.click(toggleButton);
      // Check for items that appear in the dropdown
      expect(
        await screen.findByRole('menuitemradio', { name: /light/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('menuitemradio', { name: /dark/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('menuitemradio', { name: /system/i })
      ).toBeInTheDocument();
    });

    it('should call setTheme with "light" when Light option is clicked', async () => {
      setupMocks('dark', 'dark'); // Current theme is dark
      renderThemeToggle();
      const toggleButton = screen.getByRole('button', {
        name: /toggle theme/i,
      });
      await user.click(toggleButton);
      const lightOption = await screen.findByRole('menuitemradio', {
        name: /light/i,
      });
      await user.click(lightOption);
      expect(mockSetTheme).toHaveBeenCalledWith('light');
    });

    it('should call setTheme with "dark" when Dark option is clicked', async () => {
      setupMocks('light', 'light'); // Current theme is light
      renderThemeToggle();
      const toggleButton = screen.getByRole('button', {
        name: /toggle theme/i,
      });
      await user.click(toggleButton);
      const darkOption = await screen.findByRole('menuitemradio', {
        name: /dark/i,
      });
      await user.click(darkOption);
      expect(mockSetTheme).toHaveBeenCalledWith('dark');
    });

    it('should call setTheme with "system" when System option is clicked', async () => {
      setupMocks('light', 'light'); // Current theme is light
      renderThemeToggle();
      const toggleButton = screen.getByRole('button', {
        name: /toggle theme/i,
      });
      await user.click(toggleButton);
      const systemOption = await screen.findByRole('menuitemradio', {
        name: /system/i,
      });
      await user.click(systemOption);
      expect(mockSetTheme).toHaveBeenCalledWith('system');
    });
  });

  describe('Tooltip Display', () => {
    it('should display correct tooltip for Light theme', async () => {
      setupMocks('light', 'light');
      renderThemeToggle();
      const toggleButton = screen.getByRole('button', {
        name: /toggle theme/i,
      });
      await user.hover(toggleButton);
      // Wait for tooltip to appear (Radix Tooltip is async)
      await waitFor(() => {
        expect(
          screen.getAllByText((content) => /Theme:\s*Light/.test(content))
            .length
        ).toBeGreaterThan(0);
      });
      await user.unhover(toggleButton); // Clean up
    });

    it('should display correct tooltip for Dark theme', async () => {
      setupMocks('dark', 'dark');
      renderThemeToggle();
      const toggleButton = screen.getByRole('button', {
        name: /toggle theme/i,
      });
      await user.hover(toggleButton);
      await waitFor(() => {
        expect(
          screen.getAllByText((content) => /Theme:\s*Dark/.test(content)).length
        ).toBeGreaterThan(0);
      });
      await user.unhover(toggleButton);
    });

    it('should display correct tooltip for System theme', async () => {
      setupMocks('system', 'system');
      renderThemeToggle();
      const toggleButton = screen.getByRole('button', {
        name: /toggle theme/i,
      });
      await user.hover(toggleButton);
      await waitFor(() => {
        expect(
          screen.getAllByText((content) => /Theme:\s*System/.test(content))
            .length
        ).toBeGreaterThan(0);
      });
      await user.unhover(toggleButton);
    });
  });

  // Test for initial mount when `mounted` state is false (ThemeToggle returns a placeholder)
  // This requires controlling the `useEffect` that sets `mounted` to true.
  // Vitest's JSDOM environment usually runs useEffects.
  // To test the !mounted state, we'd typically have to prevent useEffect from running or mock useState.
  // Given the setup, testing the placeholder state is complex.
  // The tests above assume `mounted` becomes true.
});
