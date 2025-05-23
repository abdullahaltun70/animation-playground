import React from 'react';

import { Theme } from '@radix-ui/themes';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, Mock } from 'vitest';

import { ExportDialog } from '@/app/(main)/playground/components/ExportDialog'; // Adjust path as necessary
import * as animationUtils from '@/app/utils/animations';
import type { AnimationConfig } from '@/types/animations';

// Mock Radix Icons
vi.mock('@radix-ui/react-icons', async (importOriginal) => {
  const original =
    await importOriginal<typeof import('@radix-ui/react-icons')>();
  return {
    ...original,
    CopyIcon: () => <svg data-testid="icon-copy" />,
  };
});

// Mock animation utility functions
vi.mock('@/app/utils/animations', () => ({
  generateReactComponent: vi.fn(),
  generateCSSCode: vi.fn(),
}));

describe('ExportDialog Component', () => {
  const mockOnOpenChange = vi.fn();
  const mockOnExportTabChange = vi.fn();
  const mockOnCopyCode = vi.fn();

  const sampleAnimationConfig: AnimationConfig = {
    type: 'fade',
    duration: 1,
    delay: 0.5,
    easing: 'ease-in',
    // Add other required fields if your AnimationConfig type is more complex
  };

  const defaultProps = {
    open: true,
    onOpenChange: mockOnOpenChange,
    exportTab: 'react',
    onExportTabChange: mockOnExportTabChange,
    onCopyCode: mockOnCopyCode,
    copySuccess: false,
    animationConfig: sampleAnimationConfig,
  };

  const renderExportDialog = (props = {}) => {
    return render(
      <Theme>
        <ExportDialog {...defaultProps} {...props} />
      </Theme>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (animationUtils.generateReactComponent as Mock).mockReturnValue(
      '<MockedReactComponent />'
    );
    (animationUtils.generateCSSCode as Mock).mockReturnValue('.mocked-css {}');
  });

  describe('Conditional Rendering', () => {
    it('should display dialog content when open={true}', () => {
      renderExportDialog();
      expect(screen.getByText('Export Animation Code')).toBeInTheDocument();
      expect(
        screen.getByText(
          'Copy the generated code to use this animation in your project.'
        )
      ).toBeInTheDocument();
      // The tab names are duplicated in the accessible name due to Radix rendering (e.g. 'React Component React Component')
      expect(
        screen.getByRole('tab', { name: /React Component/ })
      ).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /CSS/ })).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Copy Code' })
      ).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
    });

    it('should not display dialog content when open={false}', () => {
      renderExportDialog({ open: false });
      expect(
        screen.queryByText('Export Animation Code')
      ).not.toBeInTheDocument();
    });
  });

  describe('Tabs Functionality', () => {
    it('should reflect exportTab prop for active tab and call onExportTabChange on click', async () => {
      const user = userEvent.setup();
      renderExportDialog({ exportTab: 'css' }); // Start with CSS tab active

      // The tab names are duplicated in the accessible name due to Radix rendering (e.g. 'React Component React Component')
      const reactTab = screen.getByRole('tab', { name: /React Component/ });
      const cssTab = screen.getByRole('tab', { name: /CSS/ });

      expect(cssTab).toHaveAttribute('aria-selected', 'true');
      expect(cssTab).toHaveAttribute('data-state', 'active');
      expect(reactTab).toHaveAttribute('aria-selected', 'false');
      expect(reactTab).toHaveAttribute('data-state', 'inactive');

      await user.click(reactTab);
      expect(mockOnExportTabChange).toHaveBeenCalledWith('react');

      // To check if tab visually changed, re-render with new prop if needed, or check content
      // Here we assume onExportTabChange would lead to parent re-rendering with new exportTab prop
    });
  });

  describe('Code Display', () => {
    it('should call generateReactComponent and display its output when React tab is active', () => {
      renderExportDialog({
        exportTab: 'react',
        animationConfig: sampleAnimationConfig,
      });
      expect(animationUtils.generateReactComponent).toHaveBeenCalledWith(
        sampleAnimationConfig
      );
      expect(screen.getByText('<MockedReactComponent />')).toBeInTheDocument(); // Checks for the mocked output
    });

    it('should call generateCSSCode and display its output when CSS tab is active', () => {
      renderExportDialog({
        exportTab: 'css',
        animationConfig: sampleAnimationConfig,
      });
      expect(animationUtils.generateCSSCode).toHaveBeenCalledWith(
        sampleAnimationConfig
      );
      expect(screen.getByText('.mocked-css {}')).toBeInTheDocument(); // Checks for the mocked output
    });

    it('should handle null animationConfig gracefully (e.g., show empty or placeholder)', () => {
      (animationUtils.generateReactComponent as Mock).mockReturnValue(''); // Return empty for null config
      (animationUtils.generateCSSCode as Mock).mockReturnValue('');

      renderExportDialog({
        animationConfig: null as unknown,
        exportTab: 'react',
      }); // Pass null config
      expect(animationUtils.generateReactComponent).toHaveBeenCalledWith(null);
      // Check for an empty preformatted block or some placeholder text if implemented.
      // For this test, we'll assume it results in an empty code block.
      const codeBlock = screen
        .getByRole('tabpanel', { name: /React Component/ })
        .querySelector('pre');
      expect(codeBlock?.textContent).toBe('');

      renderExportDialog({
        animationConfig: null as unknown,
        exportTab: 'css',
      });
      expect(animationUtils.generateCSSCode).toHaveBeenCalledWith(null);
      const cssCodeBlock = screen
        .getByRole('tabpanel', { name: /CSS/ })
        .querySelector('pre');
      expect(cssCodeBlock?.textContent).toBe('');
    });
  });

  describe('"Copy Code" Button', () => {
    it('should call onCopyCode when "Copy Code" button is clicked', async () => {
      const user = userEvent.setup();
      renderExportDialog();
      const copyButton = screen.getByRole('button', { name: 'Copy Code' });
      await user.click(copyButton);
      expect(mockOnCopyCode).toHaveBeenCalledTimes(1);
    });

    it('should display "Code copied to clipboard!" message when copySuccess is true', () => {
      renderExportDialog({ copySuccess: true });
      expect(screen.getByText('Code copied to clipboard!')).toBeInTheDocument();
    });

    it('should not display copy success message when copySuccess is false', () => {
      renderExportDialog({ copySuccess: false });
      expect(
        screen.queryByText('Code copied to clipboard!')
      ).not.toBeInTheDocument();
    });
  });

  describe('Close Action', () => {
    it('should call onOpenChange(false) when "Close" button is clicked', async () => {
      const user = userEvent.setup();
      renderExportDialog();
      const closeButton = screen.getByRole('button', { name: 'Close' });
      await user.click(closeButton);
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });
  });
});
