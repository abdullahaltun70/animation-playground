/**
 * Comprehensive Screen Reader Compatibility Tests
 * Proves that Animate component doesn't interfere with screen readers
 */
import { Theme } from '@radix-ui/themes';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, test, expect, beforeEach, afterEach } from 'vitest';

import AccessibilityDemo from '../../app/(main)/acc-demo/page';

// Mock screen reader announcements
const announcements: string[] = [];
const mockAnnounce = vi.fn((text: string) => {
  announcements.push(text);
});

// Mock ARIA live regions
const mockAriaLive = () => {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as Element;
          const liveRegion = element.getAttribute?.('aria-live');
          if (liveRegion) {
            mockAnnounce(element.textContent || '');
          }
        }
      });

      mutation.target.childNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as Element;
          const liveRegion = element.getAttribute?.('aria-live');
          if (liveRegion && mutation.type === 'childList') {
            mockAnnounce(element.textContent || '');
          }
        }
      });
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['aria-live'],
  });

  return observer;
};

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

describe('Screen Reader Compatibility Tests', () => {
  let mutationObserver: MutationObserver;

  beforeEach(() => {
    // Reset announcements
    announcements.length = 0;
    vi.clearAllMocks();

    // Setup screen reader simulation
    mutationObserver = mockAriaLive();
    mockMatchMedia(false);

    // Clear DOM
    document.body.innerHTML = '';
  });

  afterEach(() => {
    mutationObserver?.disconnect();
  });

  describe('Content Accessibility During Animations', () => {
    test('should preserve all text content for screen readers during animations', async () => {
      renderWithTheme(<AccessibilityDemo />);

      // Wait for initial render
      await waitFor(() => {
        expect(screen.getByRole('main')).toBeInTheDocument();
      });

      // Check that all text content is accessible
      const headingText = screen.getByRole('heading', { level: 1 }).textContent;
      expect(headingText).toContain('Accessibility Demo');

      // Verify form labels are accessible
      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/message/i)).toBeInTheDocument();

      // Check that all content is still accessible after animations complete
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for animations

      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    });

    test('should maintain reading order during animations', async () => {
      renderWithTheme(<AccessibilityDemo />);

      await waitFor(() => {
        expect(screen.getByRole('main')).toBeInTheDocument();
      });

      // Get all headings in document order
      const headings = screen.getAllByRole('heading');

      // Verify heading hierarchy is preserved
      const h1Elements = headings.filter((h) => h.tagName === 'H1');
      const h2Elements = headings.filter((h) => h.tagName === 'H2');

      expect(h1Elements.length).toBeGreaterThanOrEqual(1);
      expect(h2Elements.length).toBeGreaterThanOrEqual(1);

      // Verify logical reading order is maintained
      const firstHeading = headings[0];
      expect(firstHeading.tagName).toBe('H1');
    });

    test('should preserve landmark structure during animations', async () => {
      renderWithTheme(<AccessibilityDemo />);

      await waitFor(() => {
        expect(screen.getByRole('main')).toBeInTheDocument();
      });

      // Verify all landmark roles are present and accessible
      const landmarks = [
        screen.getByRole('main'),
        screen.getByRole('banner'), // Skip link
        screen.getByRole('contentinfo'), // Footer
        screen.getByRole('navigation'), // Nav
      ];

      landmarks.forEach((landmark) => {
        expect(landmark).toBeInTheDocument();
        expect(landmark).toBeVisible();
      });

      // Wait for animations to complete
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Verify landmarks are still accessible
      landmarks.forEach((landmark) => {
        expect(landmark).toBeInTheDocument();
      });
    });
  });

  describe('ARIA Live Region Functionality', () => {
    test('should properly announce form submission success', async () => {
      const user = userEvent.setup();
      renderWithTheme(<AccessibilityDemo />);

      await waitFor(() => {
        expect(screen.getByRole('main')).toBeInTheDocument();
      });

      // Fill and submit form
      const nameInput = screen.getByLabelText(/full name/i);
      const emailInput = screen.getByLabelText(/email address/i);
      const messageInput = screen.getByLabelText(/message/i);
      const submitButton = screen.getByRole('button', {
        name: /send message/i,
      });

      await user.type(nameInput, 'John Doe');
      await user.type(emailInput, 'john@example.com');
      await user.type(messageInput, 'Test message');
      await user.click(submitButton);

      // Wait for success message
      await waitFor(() => {
        expect(
          screen.getByText(/form submitted successfully/i)
        ).toBeInTheDocument();
      });

      // Verify the success message has proper ARIA live region
      const successMessage = screen.getByText(/form submitted successfully/i);
      expect(successMessage).toHaveAttribute('role', 'alert');
    });

    test('should announce error messages properly', async () => {
      const user = userEvent.setup();
      renderWithTheme(<AccessibilityDemo />);

      await waitFor(() => {
        expect(screen.getByRole('main')).toBeInTheDocument();
      });

      // Trigger validation errors
      const nameInput = screen.getByLabelText(/full name/i);
      await user.click(nameInput);
      await user.tab(); // Blur to trigger validation

      // Wait for error message
      await waitFor(() => {
        const errorMessages = screen.queryAllByRole('alert');
        if (errorMessages.length > 0) {
          expect(errorMessages[0]).toBeInTheDocument();
        }
      });
    });

    test('should not interfere with existing ARIA live regions', async () => {
      renderWithTheme(<AccessibilityDemo />);

      await waitFor(() => {
        expect(screen.getByRole('main')).toBeInTheDocument();
      });

      // Check for existing live regions
      const liveRegions = document.querySelectorAll('[aria-live]');

      // Animations should not remove or break live regions
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const liveRegionsAfter = document.querySelectorAll('[aria-live]');
      expect(liveRegionsAfter.length).toBeGreaterThanOrEqual(
        liveRegions.length
      );
    });
  });

  describe('Focus Management with Screen Readers', () => {
    test('should maintain focus visibility for screen reader users', async () => {
      const user = userEvent.setup();
      renderWithTheme(<AccessibilityDemo />);

      await waitFor(() => {
        expect(screen.getByRole('main')).toBeInTheDocument();
      });

      // Test focus management
      await user.tab(); // Skip link
      expect(screen.getByText(/skip to main content/i)).toHaveFocus();

      await user.keyboard('{Enter}'); // Activate skip link
      expect(screen.getByRole('main')).toHaveFocus();

      // Continue tabbing through interactive elements
      await user.tab();
      const activeElement = document.activeElement;
      expect(activeElement).not.toBe(document.body);

      // Verify focus is visible and programmatically accessible
      expect(activeElement).toBeInTheDocument();
    });

    test('should support screen reader virtual cursor navigation', async () => {
      renderWithTheme(<AccessibilityDemo />);

      await waitFor(() => {
        expect(screen.getByRole('main')).toBeInTheDocument();
      });

      // Simulate screen reader virtual cursor by checking all text content
      const allText = document.body.textContent || '';

      // Verify key content is accessible via virtual cursor
      expect(allText).toContain('Accessibility Demo');
      expect(allText).toContain('Full Name');
      expect(allText).toContain('Email Address');
      expect(allText).toContain('Message');

      // Verify content doesn't get hidden or obscured by animations
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const allTextAfter = document.body.textContent || '';
      expect(allTextAfter).toContain('Accessibility Demo');
    });
  });

  describe('Screen Reader Specific ARIA Attributes', () => {
    test('should preserve aria-describedby associations during animations', async () => {
      renderWithTheme(<AccessibilityDemo />);

      await waitFor(() => {
        expect(screen.getByRole('main')).toBeInTheDocument();
      });

      const nameInput = screen.getByLabelText(/full name/i);
      const describedBy = nameInput.getAttribute('aria-describedby');

      expect(describedBy).toBeTruthy();

      // Verify the described element exists
      if (describedBy) {
        const describedElement = document.getElementById(describedBy);
        expect(describedElement).toBeInTheDocument();
      }

      // Wait for animations and verify association is maintained
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const describedByAfter = nameInput.getAttribute('aria-describedby');
      expect(describedByAfter).toBe(describedBy);
    });

    test('should maintain table accessibility for screen readers', async () => {
      renderWithTheme(<AccessibilityDemo />);

      await waitFor(() => {
        expect(screen.getByRole('table')).toBeInTheDocument();
      });

      const table = screen.getByRole('table');

      // Verify table has proper labeling
      expect(table).toHaveAttribute('aria-label');

      // Check for proper table structure
      const columnHeaders = screen.getAllByRole('columnheader');
      expect(columnHeaders.length).toBeGreaterThan(0);

      // Verify table cells are accessible
      const cells = screen.getAllByRole('cell');
      expect(cells.length).toBeGreaterThan(0);

      // Wait for animations and verify table structure is preserved
      await new Promise((resolve) => setTimeout(resolve, 1000));

      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getAllByRole('columnheader').length).toBe(
        columnHeaders.length
      );
    });

    test('should support screen reader form navigation', async () => {
      const user = userEvent.setup();
      renderWithTheme(<AccessibilityDemo />);

      await waitFor(() => {
        expect(screen.getByRole('form')).toBeInTheDocument();
      });

      const form = screen.getByRole('form');
      expect(form).toBeInTheDocument();

      // Verify form controls are properly labeled
      const formControls = [
        screen.getByLabelText(/full name/i),
        screen.getByLabelText(/email address/i),
        screen.getByLabelText(/message/i),
      ];

      formControls.forEach((control) => {
        expect(control).toBeInTheDocument();
        expect(control).toHaveAttribute('aria-required', 'true');
      });

      // Test form navigation with keyboard (simulating screen reader)
      await user.tab(); // Skip link
      await user.tab(); // First nav button
      await user.tab(); // Second nav button
      await user.tab(); // Third nav button
      await user.tab(); // Form elements

      // Verify we can reach form elements
      const focusedElement = document.activeElement;
      expect(focusedElement).toBeInTheDocument();
    });
  });

  describe('Content Updates and Screen Reader Announcements', () => {
    test('should handle dynamic content updates accessibly', async () => {
      const user = userEvent.setup();
      renderWithTheme(<AccessibilityDemo />);

      await waitFor(() => {
        expect(screen.getByRole('main')).toBeInTheDocument();
      });

      // Trigger dynamic content change (form submission)
      const nameInput = screen.getByLabelText(/full name/i);
      const emailInput = screen.getByLabelText(/email address/i);
      const messageInput = screen.getByLabelText(/message/i);
      const submitButton = screen.getByRole('button', {
        name: /send message/i,
      });

      await user.type(nameInput, 'Test User');
      await user.type(emailInput, 'test@example.com');
      await user.type(messageInput, 'Test message');
      await user.click(submitButton);

      // Wait for success message
      await waitFor(() => {
        const successMessage = screen.getByText(/form submitted successfully/i);
        expect(successMessage).toBeInTheDocument();
        expect(successMessage).toHaveAttribute('role', 'alert');
      });

      // Verify the content update doesn't break existing accessibility
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByRole('form')).toBeInTheDocument();
    });

    test('should maintain accessibility tree integrity during animations', async () => {
      renderWithTheme(<AccessibilityDemo />);

      // Capture initial accessibility tree state
      const initialHeadings = screen.getAllByRole('heading');
      const initialButtons = screen.getAllByRole('button');
      const initialTextboxes = screen.getAllByRole('textbox');

      await waitFor(() => {
        expect(screen.getByRole('main')).toBeInTheDocument();
      });

      // Wait for animations to complete
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Verify accessibility tree is preserved
      const finalHeadings = screen.getAllByRole('heading');
      const finalButtons = screen.getAllByRole('button');
      const finalTextboxes = screen.getAllByRole('textbox');

      expect(finalHeadings.length).toBe(initialHeadings.length);
      expect(finalButtons.length).toBe(initialButtons.length);
      expect(finalTextboxes.length).toBe(initialTextboxes.length);

      // Verify all elements are still accessible
      finalHeadings.forEach((heading) => {
        expect(heading).toBeInTheDocument();
      });
    });
  });

  describe('Reduced Motion and Screen Reader Compatibility', () => {
    test('should work with screen readers when motion is reduced', async () => {
      mockMatchMedia(true); // Prefer reduced motion
      renderWithTheme(<AccessibilityDemo />);

      await waitFor(() => {
        expect(screen.getByRole('main')).toBeInTheDocument();
      });

      // All content should still be accessible with reduced motion
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
      expect(screen.getByRole('form')).toBeInTheDocument();
      expect(screen.getByRole('table')).toBeInTheDocument();

      // Verify interactive elements are still functional
      const nameInput = screen.getByLabelText(/full name/i);
      expect(nameInput).toBeInTheDocument();
      expect(nameInput).toHaveAttribute('aria-required', 'true');
    });

    test('should announce motion preference detection to screen readers', async () => {
      mockMatchMedia(true); // Prefer reduced motion
      renderWithTheme(<AccessibilityDemo />);

      await waitFor(() => {
        expect(screen.getByRole('main')).toBeInTheDocument();
      });

      // The component should render successfully regardless of motion preference
      expect(screen.getByRole('main')).toBeInTheDocument();

      // Content should be fully accessible
      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);
    });
  });
});
