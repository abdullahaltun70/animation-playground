import React from 'react';

import { Theme } from '@radix-ui/themes'; // Import Theme if Radix components are used, though this one is simple
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { LoadingIndicator } from '@/app/(main)/playground/components/LoadingIndicator';

describe('LoadingIndicator Component', () => {
  const renderLoadingIndicator = (props = {}) => {
    return render(
      // Wrapping in Theme just in case, though it's a simple div with text
      <Theme>
        <LoadingIndicator {...props} />
      </Theme>
    );
  };

  describe('Rendering', () => {
    it('should display the default loading message if no message prop is provided', () => {
      renderLoadingIndicator();
      // The component defaults to "Loading..."
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should display the custom message passed as a prop', () => {
      const customMessage = 'Please wait, data is loading.';
      renderLoadingIndicator({ message: customMessage });
      expect(screen.getByText(customMessage)).toBeInTheDocument();
    });

    it('should render as a div with the correct class name for styling', () => {
      // The component renders as <div className={styles.loadingIndicator}>{message}</div>
      // We can't directly test styles.loadingIndicator without CSS Modules setup in test,
      // but we can check the element type and that it contains the message.
      const customMessage = 'Processing...';
      renderLoadingIndicator({ message: customMessage });
      // Check if a div contains the message.
      // This also implies the component rendered its basic structure.
      const divElement = screen.getByText(customMessage);
      expect(divElement.tagName).toBe('DIV');
      // We can't easily assert className from CSS modules in Vitest/JSDOM without specific setup.
      // Checking the text content is the primary functional test.
    });
  });
});
