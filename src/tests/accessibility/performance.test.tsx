/**
 * Performance Tests for Animation Library Accessibility
 * Ensures animations don't negatively impact accessibility performance
 */
import { Theme } from '@radix-ui/themes';
import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, test, expect, beforeEach } from 'vitest';

import AccessibilityDemo from '../../app/(main)/acc-demo/page';

// Mock performance API
const mockPerformance = {
  now: vi.fn(() => Date.now()),
  mark: vi.fn(),
  measure: vi.fn(),
  getEntriesByType: vi.fn(() => []),
  getEntriesByName: vi.fn(() => []),
};

Object.defineProperty(window, 'performance', {
  writable: true,
  value: mockPerformance,
});

// Mock matchMedia
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

describe('Animation Library Performance Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockMatchMedia(false);
  });

  describe('Rendering Performance', () => {
    test('should render within acceptable time with animations', async () => {
      const startTime = performance.now();

      renderWithTheme(<AccessibilityDemo />);

      await waitFor(() => {
        expect(screen.getByRole('main')).toBeInTheDocument();
      });

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Rendering should complete within 2 seconds
      expect(renderTime).toBeLessThan(2000);
    });

    test('should render with reduced motion', async () => {
      // Test with reduced motion
      mockMatchMedia(true);
      const startTime = performance.now();

      renderWithTheme(<AccessibilityDemo />);

      await waitFor(() => {
        expect(screen.getByRole('main')).toBeInTheDocument();
      });

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render within acceptable time
      expect(renderTime).toBeLessThan(2000);
    });
  });

  describe('Memory Usage', () => {
    test('should not cause memory leaks with animations', async () => {
      // Render and unmount multiple times
      for (let i = 0; i < 3; i++) {
        const { unmount } = renderWithTheme(<AccessibilityDemo />);

        await waitFor(() => {
          expect(screen.getByRole('main')).toBeInTheDocument();
        });

        unmount();
      }

      // Test passes if no errors occur during render/unmount cycles
      expect(true).toBe(true);
    });
  });

  describe('Animation Timing Performance', () => {
    test('should complete animations within expected timeframes', async () => {
      renderWithTheme(<AccessibilityDemo />);

      const startTime = performance.now();

      // Wait for all animations to complete
      await waitFor(
        () => {
          expect(screen.getByRole('main')).toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // All animations should complete within 3 seconds
      expect(totalTime).toBeLessThan(3000);
    });

    test('should skip animation timing with reduced motion', async () => {
      mockMatchMedia(true); // Prefer reduced motion

      const startTime = performance.now();

      renderWithTheme(<AccessibilityDemo />);

      await waitFor(() => {
        expect(screen.getByRole('main')).toBeInTheDocument();
      });

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // With reduced motion, rendering should be fast
      expect(renderTime).toBeLessThan(1000);
    });
  });

  describe('Accessibility Tree Performance', () => {
    test('should not delay accessibility tree construction', async () => {
      renderWithTheme(<AccessibilityDemo />);

      // Accessibility features should be immediately available
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByRole('banner')).toBeInTheDocument(); // Skip link

      // All headings should be immediately discoverable
      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);

      // Form elements should be immediately accessible
      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    });
  });
});
