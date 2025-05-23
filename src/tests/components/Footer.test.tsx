import React from 'react';

import { Theme } from '@radix-ui/themes';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

import { Footer } from '@/components/footer/Footer';

// Mock Radix Icons if they were used directly in Footer, but they are not.
// Mock next/link or RadixLink if navigation behavior needs to be spied on,
// but for Footer, we are mostly interested in href attributes.

describe('Footer Component', () => {
  const renderFooter = () => {
    return render(
      <Theme>
        <Footer />
      </Theme>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock date for consistent copyright year
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-01T00:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Rendering Content', () => {
    it('should display the copyright text with the current year', () => {
      renderFooter();
      // Text is "© {currentYear} Animation Playground"
      // Radix Text component might wrap this. We look for the text content.
      expect(
        screen.getByText(`© 2024 Animation Playground`)
      ).toBeInTheDocument();
    });

    it('should display "Terms" link with correct href', () => {
      renderFooter();
      const termsLink = screen.getByRole('link', { name: 'Terms' });
      expect(termsLink).toBeInTheDocument();
      expect(termsLink).toHaveAttribute('href', '/terms');
    });

    it('should display "Privacy" link with correct href', () => {
      renderFooter();
      const privacyLink = screen.getByRole('link', { name: 'Privacy' });
      expect(privacyLink).toBeInTheDocument();
      expect(privacyLink).toHaveAttribute('href', '/privacy');
    });

    it('should display "GitHub" link with correct href and target attributes', () => {
      renderFooter();
      const githubLink = screen.getByRole('link', { name: 'GitHub' });
      expect(githubLink).toBeInTheDocument();
      expect(githubLink).toHaveAttribute(
        'href',
        'https://github.com/abdullahaltun70/animation-playground'
      );
      expect(githubLink).toHaveAttribute('target', '_blank');
      expect(githubLink).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });
});
