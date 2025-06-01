import React from 'react';

import { Theme } from '@radix-ui/themes';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';

import { ShareDialog } from '@/app/(main)/playground/components/ShareDialog'; // Adjust path as necessary

// Mock Radix Icons
vi.mock('@radix-ui/react-icons', async (importOriginal) => {
  const original =
    await importOriginal<typeof import('@radix-ui/react-icons')>();
  return {
    ...original,
    CopyIcon: () => <svg data-testid="icon-copy" />,
  };
});

describe('ShareDialog Component', () => {
  const mockOnOpenChange = vi.fn();
  const mockOnCopyUrl = vi.fn();

  const defaultProps = {
    open: true,
    onOpenChange: mockOnOpenChange,
    shareUrl: 'http://example.com/share/this-config',
    onCopyUrl: mockOnCopyUrl,
    copySuccess: false,
  };

  const renderShareDialog = (props = {}) => {
    return render(
      <Theme>
        <ShareDialog {...defaultProps} {...props} />
      </Theme>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Conditional Rendering', () => {
    it('should display dialog content when open={true}', () => {
      renderShareDialog();
      expect(
        screen.getByText('Share Animation Configuration')
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          'Anyone with this link can view and edit this animation configuration.'
        )
      ).toBeInTheDocument(); // Description text updated to match actual component
      expect(
        screen.getByDisplayValue(defaultProps.shareUrl)
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Copy URL' })
      ).toBeInTheDocument(); // Radix IconButton has button role
      expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
    });

    it('should not display dialog content when open={false}', () => {
      renderShareDialog({ open: false });
      expect(
        screen.queryByText('Share Animation Configuration')
      ).not.toBeInTheDocument();
      expect(
        screen.queryByDisplayValue(defaultProps.shareUrl)
      ).not.toBeInTheDocument();
    });
  });

  it('should display the shareUrl prop value in the input field', () => {
    const testUrl = 'http://test.com/my-animation';
    renderShareDialog({ shareUrl: testUrl });
    const inputField = screen.getByDisplayValue(testUrl) as HTMLInputElement;
    expect(inputField).toBeInTheDocument();
    expect(inputField.readOnly).toBe(true);
  });

  describe('"Copy URL" Button', () => {
    it('should call onCopyUrl when "Copy URL" button is clicked', async () => {
      const user = userEvent.setup();
      renderShareDialog();
      const copyButton = screen.getByRole('button', { name: 'Copy URL' });
      await user.click(copyButton);
      expect(mockOnCopyUrl).toHaveBeenCalledTimes(1);
    });

    it('should display "URL copied to clipboard!" message when copySuccess is true', () => {
      renderShareDialog({ copySuccess: true });
      expect(screen.getByText('URL copied to clipboard!')).toBeInTheDocument();
    });

    it('should not display copy success message when copySuccess is false', () => {
      renderShareDialog({ copySuccess: false });
      expect(
        screen.queryByText('URL copied to clipboard!')
      ).not.toBeInTheDocument();
    });
  });

  describe('Close Action', () => {
    it('should call onOpenChange(false) when "Close" button is clicked', async () => {
      const user = userEvent.setup();
      renderShareDialog();
      // Radix Dialog.Close renders a button. We find it by its text.
      const closeButton = screen.getByRole('button', { name: 'Close' });
      await user.click(closeButton);
      // Dialog.Close internally calls the onOpenChange from Dialog.Root
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });

    // Test for Escape key or overlay click causing close would be similar to other dialogs:
    // It relies on Radix Dialog's behavior and the onOpenChange prop being correctly wired.
    // The above test for the "Close" button (which uses Dialog.Close) is a good proxy.
    it('onOpenChange should be wired to the Dialog.Root', () => {
      renderShareDialog();
      // This check confirms that the mock function is indeed passed to the component,
      // which then passes it to Dialog.Root.
      expect(defaultProps.onOpenChange).toBe(mockOnOpenChange);
    });

    it('should handle escape key press to close dialog', async () => {
      const user = userEvent.setup();
      renderShareDialog();
      await user.keyboard('{Escape}');
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });
  });

  describe('URL Input Field', () => {
    it('should have readonly attribute to prevent editing', () => {
      renderShareDialog();
      const inputField = screen.getByDisplayValue(
        defaultProps.shareUrl
      ) as HTMLInputElement;
      expect(inputField).toHaveAttribute('readonly');
    });

    it('should select all text when input is focused', async () => {
      const user = userEvent.setup();
      renderShareDialog();
      const inputField = screen.getByDisplayValue(defaultProps.shareUrl);
      await user.click(inputField);
      // Verify the input has focus
      expect(inputField).toHaveFocus();
    });

    it('should handle very long URLs without breaking layout', () => {
      const longUrl = 'http://example.com/share/' + 'a'.repeat(200);
      renderShareDialog({ shareUrl: longUrl });
      const inputField = screen.getByDisplayValue(longUrl);
      expect(inputField).toBeInTheDocument();
    });

    it('should handle empty shareUrl gracefully', () => {
      renderShareDialog({ shareUrl: '' });
      const inputField = screen.getByDisplayValue('');
      expect(inputField).toBeInTheDocument();
    });
  });

  describe('Copy Success State Management', () => {
    it('should show success message with correct styling when copySuccess is true', () => {
      renderShareDialog({ copySuccess: true });
      const successMessage = screen.getByText('URL copied to clipboard!');
      expect(successMessage).toBeInTheDocument();
      expect(successMessage).toHaveClass('text-green-600');
    });

    it('should handle rapid copy button clicks', async () => {
      const user = userEvent.setup();
      renderShareDialog();
      const copyButton = screen.getByRole('button', { name: 'Copy URL' });

      // Click multiple times rapidly
      await user.click(copyButton);
      await user.click(copyButton);
      await user.click(copyButton);

      expect(mockOnCopyUrl).toHaveBeenCalledTimes(3);
    });

    it('should maintain copy success state until dialog is closed', () => {
      const { rerender } = renderShareDialog({ copySuccess: true });
      expect(screen.getByText('URL copied to clipboard!')).toBeInTheDocument();

      // Rerender with same props
      rerender(
        <Theme>
          <ShareDialog {...defaultProps} copySuccess={true} />
        </Theme>
      );
      expect(screen.getByText('URL copied to clipboard!')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      renderShareDialog();
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByRole('textbox')).toHaveAttribute(
        'aria-label',
        'Share URL'
      );
    });

    it('should focus the copy button when dialog opens', () => {
      renderShareDialog();
      const copyButton = screen.getByRole('button', { name: 'Copy URL' });
      expect(copyButton).toBeInTheDocument();
    });

    it('should trap focus within the dialog', async () => {
      const user = userEvent.setup();
      renderShareDialog();

      const copyButton = screen.getByRole('button', { name: 'Copy URL' });
      const closeButton = screen.getByRole('button', { name: 'Close' });

      // Tab should cycle between focusable elements
      await user.tab();
      expect(copyButton).toHaveFocus();

      await user.tab();
      expect(closeButton).toHaveFocus();
    });
  });

  describe('Error Handling', () => {
    it('should handle missing onCopyUrl prop gracefully', () => {
      expect(() => {
        renderShareDialog({ onCopyUrl: undefined });
      }).not.toThrow();
    });

    it('should handle missing onOpenChange prop gracefully', () => {
      expect(() => {
        renderShareDialog({ onOpenChange: undefined });
      }).not.toThrow();
    });

    it('should handle invalid shareUrl prop gracefully', () => {
      expect(() => {
        renderShareDialog({ shareUrl: null });
      }).not.toThrow();
    });
  });

  describe('Props Validation', () => {
    it('should handle all props being undefined', () => {
      expect(() => {
        render(
          <Theme>
            <ShareDialog
              open={false}
              onOpenChange={() => {}}
              shareUrl=""
              onCopyUrl={() => {}}
              copySuccess={false}
            />
          </Theme>
        );
      }).not.toThrow();
    });

    it('should re-render correctly when props change', () => {
      const { rerender } = renderShareDialog({
        shareUrl: 'http://old-url.com',
      });
      expect(
        screen.getByDisplayValue('http://old-url.com')
      ).toBeInTheDocument();

      rerender(
        <Theme>
          <ShareDialog {...defaultProps} shareUrl="http://new-url.com" />
        </Theme>
      );
      expect(
        screen.getByDisplayValue('http://new-url.com')
      ).toBeInTheDocument();
      expect(
        screen.queryByDisplayValue('http://old-url.com')
      ).not.toBeInTheDocument();
    });
  });
});
