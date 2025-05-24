import React from 'react';

import { Theme } from '@radix-ui/themes';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import Documentation from '@/app/(main)/documentation/page';

// Component to test

describe('DocsPage Component (TypeDoc Documentation)', () => {
  const renderDocsPage = () => {
    return render(
      <Theme>
        <Documentation />
      </Theme>
    );
  };

  describe('Rendering TypeDoc Documentation', () => {
    it('should render an iframe with TypeDoc documentation', () => {
      renderDocsPage();
      const iframe = screen.getByTitle('Playground API Documentation');
      expect(iframe).toBeInTheDocument();
      expect(iframe).toHaveAttribute('src', '/docs/index.html');
    });

    it('should be wrapped in Radix Theme', () => {
      const { container } = renderDocsPage();
      const themeWrapper = container.querySelector('.radix-themes');
      expect(themeWrapper).toBeInTheDocument();
      expect(themeWrapper).toHaveAttribute('data-accent-color', 'indigo');
      expect(themeWrapper).toHaveAttribute('data-gray-color', 'slate');
    });
  });
});
