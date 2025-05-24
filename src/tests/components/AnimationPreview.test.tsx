import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';

import { AnimationPreview } from '@/app/(main)/playground/components/AnimationPreview';
import { AnimationConfig } from '@/types/animations';

// Mock the AnimatedContainer component
vi.mock('@/components/animated-container/AnimatedContainer', () => ({
  AnimatedContainer: ({ config }: { config: AnimationConfig }) => (
    <div data-testid="animated-container" data-config={JSON.stringify(config)}>
      Animated Container
    </div>
  ),
}));

// Mock the CSS module
vi.mock('@/app/(main)/playground/styles/Playground.module.scss', () => ({
  default: {
    animationArea: 'animationArea',
    actionButtons: 'actionButtons',
  },
}));

const mockConfig: AnimationConfig = {
  type: 'fade',
  duration: 1000,
  delay: 0,
  easing: 'ease',
  isPublic: false,
};

describe('AnimationPreview', () => {
  const defaultProps = {
    config: mockConfig,
    configId: 'test-config-id',
    onShare: vi.fn(),
    onExport: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the AnimatedContainer with correct config', () => {
    render(<AnimationPreview {...defaultProps} />);

    const animatedContainer = screen.getByTestId('animated-container');
    expect(animatedContainer).toBeInTheDocument();
    expect(animatedContainer).toHaveAttribute(
      'data-config',
      JSON.stringify(mockConfig)
    );
  });

  it('renders share and export buttons when configId is provided', () => {
    render(<AnimationPreview {...defaultProps} />);

    expect(screen.getByRole('button', { name: /share/i })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /export code/i })
    ).toBeInTheDocument();
  });

  it('does not render share button when configId is null', () => {
    render(<AnimationPreview {...defaultProps} configId={null} />);

    expect(
      screen.queryByRole('button', { name: /share/i })
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /export code/i })
    ).toBeInTheDocument();
  });

  it('calls onShare when share button is clicked', () => {
    render(<AnimationPreview {...defaultProps} />);

    const shareButton = screen.getByRole('button', { name: /share/i });
    fireEvent.click(shareButton);

    expect(defaultProps.onShare).toHaveBeenCalledTimes(1);
  });

  it('calls onExport when export button is clicked', () => {
    render(<AnimationPreview {...defaultProps} />);

    const exportButton = screen.getByRole('button', { name: /export code/i });
    fireEvent.click(exportButton);

    expect(defaultProps.onExport).toHaveBeenCalledTimes(1);
  });

  it('updates when config changes', () => {
    const { rerender } = render(<AnimationPreview {...defaultProps} />);

    const newConfig = { ...mockConfig, duration: 2000 };
    rerender(<AnimationPreview {...defaultProps} config={newConfig} />);

    const animatedContainer = screen.getByTestId('animated-container');
    expect(animatedContainer).toHaveAttribute(
      'data-config',
      JSON.stringify(newConfig)
    );
  });

  it('renders with different animation types', () => {
    const configs = [
      { ...mockConfig, type: 'slide' as const },
      { ...mockConfig, type: 'bounce' as const },
      { ...mockConfig, type: 'scale' as const },
    ];

    configs.forEach((config) => {
      const { unmount } = render(
        <AnimationPreview {...defaultProps} config={config} />
      );

      const animatedContainer = screen.getByTestId('animated-container');
      expect(animatedContainer).toHaveAttribute(
        'data-config',
        JSON.stringify(config)
      );

      // Clean up the component after each iteration
      unmount();
    });
  });

  it('handles different timing functions', () => {
    const easingFunctions = [
      'ease',
      'linear',
      'ease-in',
      'ease-out',
      'ease-in-out',
    ] as const;

    easingFunctions.forEach((easing) => {
      const config = { ...mockConfig, easing };
      const { unmount } = render(
        <AnimationPreview {...defaultProps} config={config} />
      );

      const animatedContainer = screen.getByTestId('animated-container');
      expect(animatedContainer).toHaveAttribute(
        'data-config',
        JSON.stringify(config)
      );

      // Clean up the component after each iteration
      unmount();
    });
  });

  it('renders with minimal required props', () => {
    const minimalProps = {
      config: mockConfig,
      configId: null,
      onShare: vi.fn(),
      onExport: vi.fn(),
    };

    expect(() => {
      render(<AnimationPreview {...minimalProps} />);
    }).not.toThrow();

    expect(screen.getByTestId('animated-container')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /export code/i })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /share/i })
    ).not.toBeInTheDocument();
  });

  it('passes config changes to AnimatedContainer', () => {
    const { rerender } = render(<AnimationPreview {...defaultProps} />);

    // Update multiple config properties
    const updatedConfig = {
      ...mockConfig,
      duration: 1500,
      delay: 200,
      easing: 'ease-in-out' as const,
      animationType: 'slideIn' as const,
    };

    rerender(<AnimationPreview {...defaultProps} config={updatedConfig} />);

    const animatedContainer = screen.getByTestId('animated-container');
    expect(animatedContainer).toHaveAttribute(
      'data-config',
      JSON.stringify(updatedConfig)
    );
  });

  it('maintains button functionality with configId changes', () => {
    const { rerender } = render(
      <AnimationPreview {...defaultProps} configId={null} />
    );

    // Initially no share button
    expect(
      screen.queryByRole('button', { name: /share/i })
    ).not.toBeInTheDocument();

    // Add configId, share button should appear
    rerender(<AnimationPreview {...defaultProps} configId="new-config-id" />);
    expect(screen.getByRole('button', { name: /share/i })).toBeInTheDocument();

    // Remove configId, share button should disappear
    rerender(<AnimationPreview {...defaultProps} configId={null} />);
    expect(
      screen.queryByRole('button', { name: /share/i })
    ).not.toBeInTheDocument();
  });
});
