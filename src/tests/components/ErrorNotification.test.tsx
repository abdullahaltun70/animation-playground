import React from 'react';

import { Theme } from '@radix-ui/themes';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';

import { ErrorNotification } from '@/app/(main)/playground/components/ErrorNotification';

describe('ErrorNotification Component', () => {
  const mockOnDismiss = vi.fn();

  const defaultProps = {
    message: 'This is a test error message.',
    onDismiss: mockOnDismiss,
  };

  const renderErrorNotification = (props = {}) => {
    return render(
      <Theme>
        {/* Assuming it might use Radix components like Button */}
        <ErrorNotification {...defaultProps} {...props} />
      </Theme>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should display the error message passed as a prop', () => {
      renderErrorNotification();
      expect(screen.getByText(defaultProps.message)).toBeInTheDocument();
    });

    it('should display a dismiss button', () => {
      renderErrorNotification();
      // The component uses a Radix Button with text "Dismiss"
      expect(
        screen.getByRole('button', { name: 'Dismiss' })
      ).toBeInTheDocument();
      // It does not use a cross icon based on its current implementation.
    });
  });

  describe('Interaction', () => {
    it('should call onDismiss when the dismiss button is clicked', async () => {
      const user = userEvent.setup();
      renderErrorNotification();

      const dismissButton = screen.getByRole('button', { name: 'Dismiss' });
      await user.click(dismissButton);

      expect(mockOnDismiss).toHaveBeenCalledTimes(1);
    });
  });
});
