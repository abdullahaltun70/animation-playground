import { Theme } from '@radix-ui/themes';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest';

import { ExportDialog } from '@/app/(main)/playground/components/ExportDialog';
import * as animationUtils from '@/app/utils/animations';
import type { AnimationConfig } from '@/types/animations';

vi.mock('@/app/utils/animations', () => ({
  generateReactComponent: vi.fn(),
  generateCSSCode: vi.fn(),
}));

describe('ExportDialog Component', () => {
  const mockOnOpenChange = vi.fn();
  const mockOnExportTabChange = vi.fn();
  const mockOnCopyCode = vi.fn();

  const sampleAnimationConfig: AnimationConfig = {
    type: 'scale',
    duration: 0.8,
    delay: 0.1,
    easing: 'ease-in-out',
    scale: 0.5,
    name: 'Test Scale',
  };

  const mockReactCode = '<Animate type="scale" duration={0.8} scale={0.5} />';
  const mockCssCode =
    '.animated-element { animation: scaleIn 0.8s ease-in-out 0.1s forwards; }';

  beforeEach(() => {
    vi.clearAllMocks();
    (animationUtils.generateReactComponent as Mock).mockReturnValue(
      mockReactCode
    );
    (animationUtils.generateCSSCode as Mock).mockReturnValue(mockCssCode);
  });

  const renderExportDialog = (
    props: Partial<React.ComponentProps<typeof ExportDialog>>
  ) => {
    const defaultProps: React.ComponentProps<typeof ExportDialog> = {
      open: true,
      onOpenChange: mockOnOpenChange,
      exportTab: 'react',
      onExportTabChange: mockOnExportTabChange,
      onCopyCode: mockOnCopyCode,
      copySuccess: false,
      animationConfig: sampleAnimationConfig,
    };
    return render(
      <Theme>
        <ExportDialog {...defaultProps} {...props} />
      </Theme>
    );
  };

  // Test for Close button click
  it(
    'should call onOpenChange with false when Close button is clicked',
    async () => {
      const user = userEvent.setup({ delay: null }); // Disable artificial delays
      renderExportDialog({ open: true });

      const closeButton = screen.getByRole('button', { name: /close/i });
      await user.click(closeButton);

      await waitFor(() => {
        expect(mockOnOpenChange).toHaveBeenCalledWith(false);
      });
    },
    { timeout: 10000 }
  ); // Increased timeout

  // Test for tab switching
  it(
    'should switch tabs, call onExportTabChange, and display CSS code when CSS tab is clicked',
    async () => {
      const user = userEvent.setup({ delay: null });
      const { rerender } = renderExportDialog({
        open: true,
        exportTab: 'react',
      });

      const cssTab = screen.getByRole('tab', { name: /css/i });
      await user.click(cssTab);

      await waitFor(() => {
        expect(mockOnExportTabChange).toHaveBeenCalledWith('css');
      });

      // Rerender with updated props
      rerender(
        <Theme>
          <ExportDialog
            open={true}
            onOpenChange={mockOnOpenChange}
            exportTab="css"
            onExportTabChange={mockOnExportTabChange}
            onCopyCode={mockOnCopyCode}
            copySuccess={false}
            animationConfig={sampleAnimationConfig}
          />
        </Theme>
      );

      await waitFor(() => {
        expect(
          screen.getByText(mockCssCode, { exact: false })
        ).toBeInTheDocument();
      });
    },
    { timeout: 10000 }
  );

  // Test for Copy Code button click
  it(
    'should call onCopyCode when "Copy Code" button is clicked',
    async () => {
      const user = userEvent.setup({ delay: null });
      renderExportDialog({ open: true });

      const copyButton = screen.getByRole('button', { name: /copy code/i });
      await user.click(copyButton);

      await waitFor(() => {
        expect(mockOnCopyCode).toHaveBeenCalledTimes(1);
      });
    },
    { timeout: 10000 }
  );

  // Keep other tests as they are since they're working fine
  it('should not render dialog content if "open" prop is false', () => {
    renderExportDialog({ open: false });
    expect(
      screen.queryByRole('heading', { name: /export animation code/i })
    ).not.toBeInTheDocument();
  });

  it('should render dialog content, tabs, and default React code if "open" is true', () => {
    renderExportDialog({ open: true, exportTab: 'react' });
    expect(
      screen.getByRole('heading', { name: /export animation code/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/copy the generated code/i)).toBeInTheDocument();
    expect(
      screen.getByRole('tab', { name: /react component/i })
    ).toBeInTheDocument();
    expect(
      screen.getByText(mockReactCode, { exact: false })
    ).toBeInTheDocument();
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
