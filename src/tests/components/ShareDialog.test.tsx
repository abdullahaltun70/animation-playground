// src/app/(main)/playground/components/ShareDialog.test.tsx
import { Theme } from '@radix-ui/themes'; // Import Theme
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { ShareDialog } from '@/app/(main)/playground/components/ShareDialog';

// Mock navigator.clipboard if not already globally mocked in vitest.setup.ts
// If it's in setup, this local mock might not be needed or could conflict.
// Assuming it's NOT globally mocked for this specific component test for clarity.
// If it IS in vitest.setup.ts, you can remove this local mock.
const mockClipboardWriteText = vi.fn();
if (typeof navigator !== 'undefined' && !navigator.clipboard) {
  Object.defineProperty(navigator, 'clipboard', {
    value: {
      writeText: mockClipboardWriteText,
    },
    configurable: true,
    writable: true,
  });
} else if (typeof navigator !== 'undefined') {
  // @ts-ignore
  navigator.clipboard.writeText = mockClipboardWriteText;
} else {
  // @ts-ignore
  global.navigator = { clipboard: { writeText: mockClipboardWriteText } };
}

describe('ShareDialog Component', () => {
  const mockOnOpenChange = vi.fn();
  const mockOnCopyUrl = vi.fn();
  const sampleShareUrl = 'http://localhost:3000/playground?id=share123';

  beforeEach(() => {
    vi.clearAllMocks();
    mockClipboardWriteText.mockResolvedValue(undefined); // Default success for clipboard
  });

  const renderShareDialog = (
    props: Partial<React.ComponentProps<typeof ShareDialog>>
  ) => {
    const defaultProps: React.ComponentProps<typeof ShareDialog> = {
      open: true,
      onOpenChange: mockOnOpenChange,
      shareUrl: sampleShareUrl,
      onCopyUrl: mockOnCopyUrl,
      copySuccess: false,
    };
    // Wrap with Radix Theme for context if your dialog uses Radix components heavily
    return render(
      <Theme>
        <ShareDialog {...defaultProps} {...props} />
      </Theme>
    );
  };

  it('should not render the dialog content if "open" prop is false', () => {
    renderShareDialog({ open: false });
    // Radix Dialog.Content is typically removed from the DOM when not open.
    // We check for a unique element within the dialog, like its title.
    expect(
      screen.queryByRole('heading', { name: /share animation configuration/i })
    ).not.toBeInTheDocument();
  });

  it('should render the dialog content if "open" prop is true', () => {
    renderShareDialog({ open: true });
    expect(
      screen.getByRole('heading', { name: /share animation configuration/i })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/anyone with this link can view/i)
    ).toBeInTheDocument(); // Description
    expect(screen.getByRole('textbox')).toHaveValue(sampleShareUrl); // TextField.Root
    expect(
      screen.getByRole('button', { name: 'Copy URL' })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();
  });

  it('should display the provided shareUrl in the text field', () => {
    const specificUrl = 'http://example.com/specific-share';
    renderShareDialog({ shareUrl: specificUrl });
    expect(screen.getByRole('textbox')).toHaveValue(specificUrl);
  });

  it('should call onCopyUrl when the "Copy" button is clicked', async () => {
    const user = userEvent.setup();
    renderShareDialog({ open: true });
    const copyButton = screen.getByRole('button', { name: 'Copy URL' }); // Radix IconButton might not have a "name" by default

    await user.click(copyButton);
    expect(mockOnCopyUrl).toHaveBeenCalledTimes(1);
  });

  it('should call onOpenChange with false when the "Close" button is clicked', async () => {
    const user = userEvent.setup();
    renderShareDialog({ open: true }); // Ensure it's open
    const closeButton = screen.getByRole('button', { name: /close/i });

    await user.click(closeButton);
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
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
