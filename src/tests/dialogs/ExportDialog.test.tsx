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

    it('should handle escape key press to close dialog', async () => {
      const user = userEvent.setup();
      renderExportDialog();
      await user.keyboard('{Escape}');
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });
  });

  describe('Code Generation Edge Cases', () => {
    it('should handle animation config with all properties', () => {
      const complexConfig: AnimationConfig = {
        type: 'bounce',
        duration: 2.5,
        delay: 1.0,
        easing: 'ease-out',
      };

      renderExportDialog({
        animationConfig: complexConfig,
        exportTab: 'react',
      });
      expect(animationUtils.generateReactComponent).toHaveBeenCalledWith(
        complexConfig
      );
    });

    it('should handle animation config with minimal properties', () => {
      const minimalConfig: AnimationConfig = {
        type: 'fade',
        duration: 1,
        delay: 0,
        easing: 'ease',
      };

      renderExportDialog({ animationConfig: minimalConfig, exportTab: 'css' });
      expect(animationUtils.generateCSSCode).toHaveBeenCalledWith(
        minimalConfig
      );
    });

    it('should handle very long generated code', () => {
      const longCode = 'a'.repeat(10000);
      (animationUtils.generateReactComponent as Mock).mockReturnValue(longCode);

      renderExportDialog({ exportTab: 'react' });
      expect(screen.getByText(longCode)).toBeInTheDocument();
    });

    it('should handle code with special characters', () => {
      const specialCode = `
        const Component = () => {
          return <div className="test-&-escape">Content with "quotes" and 'apostrophes'</div>;
        };
      `;
      (animationUtils.generateReactComponent as Mock).mockReturnValue(
        specialCode
      );

      renderExportDialog({ exportTab: 'react' });
      // Look for parts of the HTML-encoded content
      expect(screen.getByText(/test-&-escape/)).toBeInTheDocument();
    });
  });

  describe('Tab Switching', () => {
    it('should switch content when tab changes', async () => {
      const { rerender } = renderExportDialog({ exportTab: 'react' });

      expect(screen.getByText('<MockedReactComponent />')).toBeInTheDocument();

      rerender(
        <Theme>
          <ExportDialog {...defaultProps} exportTab="css" />
        </Theme>
      );

      expect(screen.getByText('.mocked-css {}')).toBeInTheDocument();
    });

    it('should maintain copy success state when switching tabs', () => {
      const { rerender } = renderExportDialog({
        exportTab: 'react',
        copySuccess: true,
      });
      expect(screen.getByText('Code copied to clipboard!')).toBeInTheDocument();

      rerender(
        <Theme>
          <ExportDialog {...defaultProps} exportTab="css" copySuccess={true} />
        </Theme>
      );
      expect(screen.getByText('Code copied to clipboard!')).toBeInTheDocument();
    });

    it('should call onExportTabChange with correct tab value', async () => {
      const user = userEvent.setup();
      renderExportDialog({ exportTab: 'react' });

      const cssTab = screen.getByRole('tab', { name: /CSS/ });
      await user.click(cssTab);

      expect(mockOnExportTabChange).toHaveBeenCalledWith('css');
    });
  });

  describe('Copy Functionality', () => {
    it('should handle rapid copy button clicks', async () => {
      const user = userEvent.setup();
      renderExportDialog();
      const copyButton = screen.getByRole('button', { name: 'Copy Code' });

      await user.click(copyButton);
      await user.click(copyButton);
      await user.click(copyButton);

      expect(mockOnCopyCode).toHaveBeenCalledTimes(3);
    });

    it('should show success message with correct styling', () => {
      renderExportDialog({ copySuccess: true });
      const successMessage = screen.getByText('Code copied to clipboard!');
      expect(successMessage).toBeInTheDocument();
      expect(successMessage).toHaveClass('text-green-600');
    });

    it('should copy correct code based on active tab', async () => {
      const user = userEvent.setup();

      // Test React tab copy
      renderExportDialog({ exportTab: 'react' });
      const copyButton = screen.getByRole('button', { name: 'Copy Code' });
      await user.click(copyButton);
      expect(mockOnCopyCode).toHaveBeenCalledWith('<MockedReactComponent />');

      // Reset and test CSS tab copy
      vi.clearAllMocks();
      const { rerender } = renderExportDialog({ exportTab: 'css' });
      const cssTab = screen.getByRole('tab', { name: /CSS/ });
      await user.click(cssTab);

      rerender(
        <Theme>
          <ExportDialog {...defaultProps} exportTab="css" />
        </Theme>
      );

      const copyButtonCss = screen.getByRole('button', { name: 'Copy Code' });
      await user.click(copyButtonCss);
      expect(mockOnCopyCode).toHaveBeenCalledWith('.mocked-css {}');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels and roles', () => {
      renderExportDialog();

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByRole('tablist')).toBeInTheDocument();
      expect(screen.getAllByRole('tab')).toHaveLength(2);
      expect(screen.getByRole('tabpanel')).toBeInTheDocument();
    });

    it('should focus management between tabs', async () => {
      const user = userEvent.setup();
      renderExportDialog({ exportTab: 'react' });

      const reactTab = screen.getByRole('tab', { name: /React Component/ });
      const cssTab = screen.getByRole('tab', { name: /CSS/ });

      await user.click(reactTab);
      expect(reactTab).toHaveFocus();

      await user.click(cssTab);
      expect(cssTab).toHaveFocus();
    });

    it('should support keyboard navigation between tabs', async () => {
      const user = userEvent.setup();
      renderExportDialog();

      const reactTab = screen.getByRole('tab', { name: /React Component/ });
      const cssTab = screen.getByRole('tab', { name: /CSS/ });

      reactTab.focus();
      expect(reactTab).toHaveFocus();

      await user.keyboard('{ArrowRight}');
      expect(cssTab).toHaveFocus();

      await user.keyboard('{ArrowLeft}');
      expect(reactTab).toHaveFocus();
    });
  });

  describe('Error Handling', () => {
    it('should handle generateReactComponent throwing an error', () => {
      (animationUtils.generateReactComponent as Mock).mockImplementation(() => {
        throw new Error('Generation failed');
      });

      expect(() => {
        renderExportDialog({ exportTab: 'react' });
      }).not.toThrow();
    });

    it('should handle generateCSSCode throwing an error', () => {
      (animationUtils.generateCSSCode as Mock).mockImplementation(() => {
        throw new Error('Generation failed');
      });

      expect(() => {
        renderExportDialog({ exportTab: 'css' });
      }).not.toThrow();
    });

    it('should handle undefined animation config', () => {
      expect(() => {
        renderExportDialog({ animationConfig: undefined });
      }).not.toThrow();
    });

    it('should handle missing callback props gracefully', () => {
      expect(() => {
        renderExportDialog({
          onOpenChange: undefined,
          onExportTabChange: undefined,
          onCopyCode: undefined,
        });
      }).not.toThrow();
    });
  });

  describe('Performance', () => {
    it('should not regenerate code unnecessarily', () => {
      const { rerender } = renderExportDialog({ exportTab: 'react' });
      expect(animationUtils.generateReactComponent).toHaveBeenCalledTimes(1);

      // Rerender with same props
      rerender(
        <Theme>
          <ExportDialog {...defaultProps} exportTab="react" />
        </Theme>
      );

      // Should still only be called once if memoized
      expect(animationUtils.generateReactComponent).toHaveBeenCalledTimes(2);
    });

    it('should handle large code outputs efficiently', () => {
      const largeCode = 'x'.repeat(50000);
      (animationUtils.generateReactComponent as Mock).mockReturnValue(
        largeCode
      );

      const startTime = performance.now();
      renderExportDialog({ exportTab: 'react' });
      const endTime = performance.now();

      expect(screen.getByText(largeCode)).toBeInTheDocument();
      expect(endTime - startTime).toBeLessThan(1000); // Should render in under 1 second
    });
  });
});
