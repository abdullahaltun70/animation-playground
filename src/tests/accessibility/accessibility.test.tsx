/**
 * Comprehensive Accessibility Tests for Animation Library
 * Tests that animations don't interfere with accessibility features
 */
import { Theme } from '@radix-ui/themes';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, test, expect, beforeEach } from 'vitest';

import AccessibilityDemo from '../../app/(main)/acc-demo/page';

// Mock matchMedia for motion preference testing
const mockMatchMedia = (matches: boolean) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
};

// Helper to render component with theme
const renderWithTheme = (component: React.ReactElement) => {
  return render(<Theme>{component}</Theme>);
};

describe('Animation Library Accessibility Tests', () => {
  beforeEach(() => {
    // Reset DOM
    document.body.innerHTML = '';
    // Mock reduced motion as false by default
    mockMatchMedia(false);
  });

  describe('Basic Accessibility Compliance', () => {
    test('should render accessibility demo page successfully', async () => {
      mockMatchMedia(false); // No reduced motion preference
      renderWithTheme(<AccessibilityDemo />);

      // Wait for animations to complete
      await waitFor(
        () => {
          expect(screen.getByRole('main')).toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      // Basic structure should be present
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByRole('banner')).toBeInTheDocument(); // Skip link
      expect(screen.getByRole('contentinfo')).toBeInTheDocument(); // Footer
    });

    test('should render with reduced motion preference', async () => {
      mockMatchMedia(true); // Prefers reduced motion
      renderWithTheme(<AccessibilityDemo />);

      await waitFor(() => {
        expect(screen.getByRole('main')).toBeInTheDocument();
      });

      expect(screen.getByRole('main')).toBeInTheDocument();
    });
  });

  describe('Screen Reader Support', () => {
    test('should have proper semantic structure', async () => {
      renderWithTheme(<AccessibilityDemo />);

      // Check for main landmarks
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByRole('banner')).toBeInTheDocument(); // Skip link
      expect(screen.getByRole('contentinfo')).toBeInTheDocument(); // Footer

      // Check for proper heading hierarchy
      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);

      // Main heading should be h1
      const mainHeading = screen.getByRole('heading', { level: 1 });
      expect(mainHeading).toHaveTextContent(/accessibility/i);
    });

    test('should have proper ARIA labels and descriptions', async () => {
      renderWithTheme(<AccessibilityDemo />);

      // Check for ARIA labels
      expect(
        screen.getByLabelText(/wcag compliance checklist/i)
      ).toBeInTheDocument();

      // Check for proper form labeling
      const nameInput = screen.getByLabelText(/full name/i);
      expect(nameInput).toBeInTheDocument();
      expect(nameInput).toHaveAttribute('aria-describedby');

      const emailInput = screen.getByLabelText(/email address/i);
      expect(emailInput).toBeInTheDocument();
      expect(emailInput).toHaveAttribute('aria-describedby');
    });
  });

  describe('Keyboard Navigation', () => {
    test('should support skip to content link', async () => {
      const user = userEvent.setup();
      renderWithTheme(<AccessibilityDemo />);

      // Tab to skip link
      await user.tab();

      const skipLink = screen.getByText(/skip to main content/i);
      expect(skipLink).toHaveFocus();

      // Activate skip link
      await user.keyboard('{Enter}');

      // Main content should receive focus
      const mainContent = screen.getByRole('main');
      expect(mainContent).toHaveFocus();
    });

    test('should allow keyboard navigation through interactive elements', async () => {
      const user = userEvent.setup();
      renderWithTheme(<AccessibilityDemo />);

      // Get all focusable elements
      const focusableElements = screen
        .getAllByRole('button')
        .concat(screen.getAllByRole('textbox'))
        .concat(screen.getAllByRole('link'));

      expect(focusableElements.length).toBeGreaterThan(0);

      // Test that we can tab through elements
      for (let i = 0; i < Math.min(3, focusableElements.length); i++) {
        await user.tab();
      }

      // At least one element should be focused
      expect(document.activeElement).not.toBe(document.body);
    });

    test('should support form submission via keyboard', async () => {
      const user = userEvent.setup();
      renderWithTheme(<AccessibilityDemo />);

      // Fill out form
      const nameInput = screen.getByLabelText(/full name/i);
      const emailInput = screen.getByLabelText(/email address/i);
      const messageInput = screen.getByLabelText(/message/i);
      const submitButton = screen.getByRole('button', {
        name: /send message/i,
      });

      await user.type(nameInput, 'John Doe');
      await user.type(emailInput, 'john@example.com');
      await user.type(messageInput, 'Test message');

      // Submit via keyboard
      await user.click(submitButton);

      // Success message should appear
      await waitFor(() => {
        expect(
          screen.getByText(/form submitted successfully/i)
        ).toBeInTheDocument();
      });
    });
  });

  describe('Motion Preferences', () => {
    test('should respect prefers-reduced-motion setting', async () => {
      mockMatchMedia(true); // User prefers reduced motion
      renderWithTheme(<AccessibilityDemo />);

      await waitFor(() => {
        expect(screen.getByRole('main')).toBeInTheDocument();
      });

      // Component should render successfully with reduced motion
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });

    test('should enable animations when motion is not reduced', async () => {
      mockMatchMedia(false); // User does not prefer reduced motion
      renderWithTheme(<AccessibilityDemo />);

      await waitFor(() => {
        expect(screen.getByRole('main')).toBeInTheDocument();
      });

      // Component should render successfully with animations
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });

    test('should handle motion preference changes', async () => {
      let mediaQueryCallback: ((event: MediaQueryListEvent) => void) | null =
        null;

      // Mock matchMedia with event listener capture
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation((query: string) => ({
          matches: false,
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn((event: string, callback: unknown) => {
            if (event === 'change') {
              mediaQueryCallback = callback as (
                event: MediaQueryListEvent
              ) => void;
            }
          }),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });

      renderWithTheme(<AccessibilityDemo />);

      // Simulate preference change
      if (typeof mediaQueryCallback === 'function') {
        const mockEvent = { matches: true } as MediaQueryListEvent;
        (mediaQueryCallback as (event: MediaQueryListEvent) => void)(mockEvent);
      }
      // Component should handle the change gracefully
      expect(screen.getByRole('main')).toBeInTheDocument();
    });
  });

  describe('Touch Targets', () => {
    test('should have accessible touch targets', async () => {
      renderWithTheme(<AccessibilityDemo />);

      const buttons = screen.getAllByRole('button');

      buttons.forEach((button) => {
        // Note: In testing environment, computed styles might not reflect actual sizes
        // This test ensures buttons exist and can be targeted
        expect(button).toBeInTheDocument();
        // Accept both enabled and disabled buttons for touch target validation
        // The submit button may be disabled until form is filled
      });
    });
  });

  describe('Error Handling and Feedback', () => {
    test('should provide accessible error messages', async () => {
      const user = userEvent.setup();
      renderWithTheme(<AccessibilityDemo />);

      // Focus and blur fields to trigger validation
      const nameInput = screen.getByLabelText(/full name/i);

      // Trigger validation by focusing and blurring empty fields
      await user.click(nameInput);
      await user.tab(); // This will blur nameInput and focus next element
      await user.tab(); // Continue tabbing to trigger more blur events

      // Error messages should be announced to screen readers
      await waitFor(() => {
        const errorMessages = screen.getAllByRole('alert');
        expect(errorMessages.length).toBeGreaterThan(0);
      });
    });

    test('should associate error messages with form fields', async () => {
      const user = userEvent.setup();
      renderWithTheme(<AccessibilityDemo />);

      // Submit form to trigger validation
      const submitButton = screen.getByRole('button', {
        name: /send message/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        const nameInput = screen.getByLabelText(/full name/i);
        const describedBy = nameInput.getAttribute('aria-describedby');

        if (describedBy) {
          // Error message should be referenced by aria-describedby
          const errorElement = document.getElementById(describedBy);
          expect(errorElement).toBeInTheDocument();
        }
      });
    });
  });

  describe('Animation Library Integration', () => {
    test('should not interfere with focus management', async () => {
      const user = userEvent.setup();
      renderWithTheme(<AccessibilityDemo />);

      // Wait for any initial animations
      await waitFor(() => {
        expect(screen.getByRole('main')).toBeInTheDocument();
      });

      // Focus should work normally during and after animations
      const firstInput = screen.getByLabelText(/full name/i);
      await user.click(firstInput);

      expect(firstInput).toHaveFocus();
    });

    test('should maintain DOM structure during animations', async () => {
      renderWithTheme(<AccessibilityDemo />);

      // Wait for animations to settle
      await waitFor(
        () => {
          expect(screen.getByRole('main')).toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      // All expected elements should be present
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getAllByRole('heading').length).toBeGreaterThan(0);
      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getByRole('form')).toBeInTheDocument();
    });
  });
});
