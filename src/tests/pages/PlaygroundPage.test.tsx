import React from 'react';

import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock next/navigation
const mockRouterPush = vi.fn();
const mockUsePathname = vi.fn().mockReturnValue('/playground');
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockRouterPush,
    // Add other router methods if needed by PlaygroundPage
  }),
  usePathname: () => mockUsePathname(),
}));

// Mock next/router (for Router.events)
const mockRouterEventsOn = vi.fn();
const mockRouterEventsOff = vi.fn();
const mockRouterEventsEmit = vi.fn();
vi.mock('next/router', () => ({
  __esModule: true, // Required for modules with default exports when using vi.mock
  default: {
    events: {
      on: mockRouterEventsOn,
      off: mockRouterEventsOff,
      emit: mockRouterEventsEmit,
    },
    // Mock other router properties if PlaygroundPage uses them directly
  },
}));

// Mock Hooks
const mockUseAnimationConfigValues = {
  animationConfig: {
    type: 'fade',
    duration: 0.5,
    name: 'Test Config',
  } as unknown,
  setAnimationConfig: vi.fn(),
  loading: false,
  error: null as string | null,
  setError: vi.fn(),
  configId: null as string | null,
  isReadOnly: false,
  isDirty: false,
  configTitle: '',
  copyConfig: vi.fn().mockResolvedValue(true),
  saveConfig: vi.fn().mockResolvedValue(true),
  resetConfig: vi.fn(),
};
vi.mock('@/app/(main)/playground/hooks/useAnimationConfig', () => ({
  useAnimationConfig: () => mockUseAnimationConfigValues,
}));

const mockUseShareExportValues = {
  shareDialogOpen: false,
  setShareDialogOpen: vi.fn(),
  exportDialogOpen: false,
  setExportDialogOpen: vi.fn(),
  shareUrl: '',
  copySuccess: false,
  exportTab: 'react',
  setExportTab: vi.fn(),
  error: null,
  setError: vi.fn(), // Added setError to mock
  handleShare: vi.fn(),
  handleExport: vi.fn(),
  handleCopyUrl: vi.fn(),
  handleCopyCode: vi.fn(),
};
vi.mock('@/app/(main)/playground/hooks/useShareExport', () => ({
  useShareExport: () => mockUseShareExportValues,
}));

// Mock Child Components
vi.mock('@/app/(main)/playground/components/AnimationPreview', () => ({
  AnimationPreview: vi.fn(({ onShare, onExport, config, configId }) => (
    <div
      data-testid="mock-animation-preview"
      data-configid={configId}
      data-configname={config?.name}
    >
      <button onClick={onShare}>Mock Share</button>
      <button onClick={onExport}>Mock Export</button>
    </div>
  )),
}));
vi.mock('@/components/config-panel/ConfigPanel', () => ({
  ConfigPanel: vi.fn(
    ({
      initialConfig,
      onConfigChange,
      onSave,
      onReset,
      isReadOnly,
      saveButtonText,
    }) => (
      <div
        data-testid="mock-config-panel"
        data-initialconfigname={initialConfig?.name}
        data-isreadonly={isReadOnly}
        data-savebuttontext={saveButtonText}
      >
        <button
          onClick={() =>
            onConfigChange ? onConfigChange({} as unknown) : null
          }
        >
          Mock ConfigChange
        </button>
        <button onClick={() => (onSave ? onSave({} as unknown) : null)}>
          Mock Save
        </button>
        <button onClick={() => (onReset ? onReset() : null)}>Mock Reset</button>
      </div>
    )
  ),
}));
vi.mock('@/app/(main)/playground/components/ShareDialog', () => ({
  ShareDialog: vi.fn(({ open, shareUrl }) =>
    open ? (
      <div data-testid="mock-share-dialog" data-shareurl={shareUrl}>
        Share Dialog Open
      </div>
    ) : null
  ),
}));
vi.mock('@/app/(main)/playground/components/ExportDialog', () => ({
  ExportDialog: vi.fn(({ open }) =>
    open ? <div data-testid="mock-export-dialog">Export Dialog Open</div> : null
  ),
}));
vi.mock('@/components/dialogs/UnsavedChangesDialog', () => ({
  UnsavedChangesDialog: vi.fn(({ open, onConfirmLeave, onCancel }) =>
    open ? (
      <div data-testid="mock-unsaved-changes-dialog">
        <button onClick={onConfirmLeave}>Confirm Leave</button>
        <button onClick={onCancel}>Cancel Leave</button>
      </div>
    ) : null
  ),
}));
vi.mock('@/app/(main)/playground/components/ErrorNotification', () => ({
  ErrorNotification: vi.fn(({ message, onDismiss }) => (
    <div data-testid="mock-error-notification">
      {message}
      <button onClick={onDismiss}>Dismiss Error</button>
    </div>
  )),
}));
vi.mock('@/app/(main)/playground/components/LoadingIndicator', () => ({
  LoadingIndicator: vi.fn(() => (
    <div data-testid="mock-loading-indicator">Loading...</div>
  )),
}));

// Import the component to test AFTER all mocks are set up
// Due to Vitest hoisting, dynamic import or require might be needed if direct import causes issues.
// For now, let's try direct import.
import PlaygroundPage from '@/app/(main)/playground/page';

// eslint-disable-next-line import/order
import { Theme } from '@radix-ui/themes';

describe('PlaygroundPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mock hook values to defaults before each test
    Object.assign(mockUseAnimationConfigValues, {
      animationConfig: {
        type: 'fade',
        duration: 0.5,
        name: 'Test Config',
      } as unknown,
      setAnimationConfig: vi.fn(),
      loading: false,
      error: null as string | null,
      setError: vi.fn(),
      configId: null as string | null,
      isReadOnly: false,
      isDirty: false,
      configTitle: '',
      copyConfig: vi.fn().mockResolvedValue(true),
      saveConfig: vi.fn().mockResolvedValue(true),
      resetConfig: vi.fn(),
    });
    Object.assign(mockUseShareExportValues, {
      shareDialogOpen: false,
      setShareDialogOpen: vi.fn(),
      exportDialogOpen: false,
      setExportDialogOpen: vi.fn(),
      shareUrl: '',
      copySuccess: false,
      exportTab: 'react',
      setExportTab: vi.fn(),
      error: null,
      setError: vi.fn(),
      handleShare: vi.fn(),
      handleExport: vi.fn(),
      handleCopyUrl: vi.fn(),
      handleCopyCode: vi.fn(),
    });
    mockUsePathname.mockReturnValue('/playground');
  });

  const renderPlaygroundPage = () => {
    return render(
      <Theme>
        <PlaygroundPage />
      </Theme>
    );
  };

  describe('Initial Rendering', () => {
    it('should render AnimationPreview and ConfigPanel', () => {
      renderPlaygroundPage();
      expect(screen.getByTestId('mock-animation-preview')).toBeInTheDocument();
      expect(screen.getByTestId('mock-config-panel')).toBeInTheDocument();
    });

    it('dialogs should be initially hidden', () => {
      renderPlaygroundPage();
      expect(screen.queryByTestId('mock-share-dialog')).not.toBeInTheDocument();
      expect(
        screen.queryByTestId('mock-export-dialog')
      ).not.toBeInTheDocument();
      expect(
        screen.queryByTestId('mock-unsaved-changes-dialog')
      ).not.toBeInTheDocument();
    });

    it('should not render loading indicator or error notification initially', () => {
      renderPlaygroundPage();
      expect(
        screen.queryByTestId('mock-loading-indicator')
      ).not.toBeInTheDocument();
      expect(
        screen.queryByTestId('mock-error-notification')
      ).not.toBeInTheDocument();
    });
  });

  describe('useAnimationConfig State Handling', () => {
    it('should display LoadingIndicator when loading is true', () => {
      mockUseAnimationConfigValues.loading = true;
      renderPlaygroundPage();
      expect(screen.getByTestId('mock-loading-indicator')).toBeInTheDocument();
    });

    it('should display ErrorNotification when error is present and allow dismiss', async () => {
      const user = userEvent.setup();
      mockUseAnimationConfigValues.error = 'Test Error Message';
      renderPlaygroundPage();

      const errorNotification = screen.getByTestId('mock-error-notification');
      expect(errorNotification).toBeInTheDocument();
      expect(errorNotification).toHaveTextContent('Test Error Message');

      const dismissButton = screen.getByText('Dismiss Error'); // Text from mock
      await user.click(dismissButton);
      expect(mockUseAnimationConfigValues.setError).toHaveBeenCalledWith(null);
    });

    it('should display read-only banner and call copyConfig on "Make a copy" click', async () => {
      const user = userEvent.setup();
      mockUseAnimationConfigValues.isReadOnly = true;
      mockUseAnimationConfigValues.configId = 'some-id'; // Read-only banner implies a loaded config
      renderPlaygroundPage();

      expect(
        screen.getByText(
          "You are viewing someone else's animation configuration. Make a copy to edit it."
        )
      ).toBeInTheDocument();
      const copyButton = screen.getByRole('button', { name: 'Make a copy' });
      await user.click(copyButton);
      expect(mockUseAnimationConfigValues.copyConfig).toHaveBeenCalled();
    });

    // Test for Copy Success Message: This relies on how PlaygroundPage implements this.
    // Assuming it uses a state variable `copyCompleted` which is set after `copyConfig` resolves.
    // We'll need to trigger this state change.
    it('should display copy success message when copyCompleted is true', async () => {
      // This test requires PlaygroundPage to have its own state for copyCompleted,
      // which it does. We'll set it directly after a "successful" copy.
      mockUseAnimationConfigValues.isReadOnly = true; // Scenario where copy button is visible
      mockUseAnimationConfigValues.configId = 'some-id';

      renderPlaygroundPage();

      const user = userEvent.setup();
      const copyButton = screen.getByRole('button', { name: 'Make a copy' });

      // Simulate copyConfig resolving and PlaygroundPage setting its internal copyCompleted state
      mockUseAnimationConfigValues.copyConfig.mockResolvedValueOnce(true);
      await user.click(copyButton);

      // At this point, PlaygroundPage's internal handleCopyConfig would run.
      // We need to wait for its internal state update.
      // Since we can't directly set PlaygroundPage's state from here,
      // we rely on the visual outcome.
      // The component internally sets copyCompleted to true then false after a timeout.
      // We will look for the message.
      await waitFor(() => {
        expect(
          screen.getByText(
            'Configuration copied successfully! You can now edit it.'
          )
        ).toBeInTheDocument();
      });
    });
  });

  describe('useShareExport State Handling & Dialogs', () => {
    it('ShareDialog: should call handleShare and show dialog', async () => {
      mockUseAnimationConfigValues.configId = 'test-share-id'; // Prerequisite for share button in mock
      renderPlaygroundPage();
      const user = userEvent.setup();

      // Trigger onShare from within the mocked AnimationPreview
      const shareButton = screen.getByText('Mock Share'); // Text from mock
      await user.click(shareButton);
      expect(mockUseShareExportValues.handleShare).toHaveBeenCalled();

      // Now simulate the dialog being opened by the hook
      mockUseShareExportValues.shareDialogOpen = true;
      mockUseShareExportValues.shareUrl = 'http://test.share.url/id';
      renderPlaygroundPage(); // Re-render with updated mock values

      const shareDialog = screen.getByTestId('mock-share-dialog');
      expect(shareDialog).toBeInTheDocument();
      expect(shareDialog).toHaveAttribute(
        'data-shareurl',
        'http://test.share.url/id'
      );
    });

    it('ExportDialog: should call handleExport and show dialog', async () => {
      renderPlaygroundPage();
      const user = userEvent.setup();

      // Trigger onExport from within the mocked AnimationPreview
      const exportButton = screen.getByText('Mock Export'); // Text from mock
      await user.click(exportButton);
      expect(mockUseShareExportValues.handleExport).toHaveBeenCalled();

      // Now simulate the dialog being opened by the hook
      mockUseShareExportValues.exportDialogOpen = true;
      renderPlaygroundPage(); // Re-render with updated mock values
      expect(screen.getByTestId('mock-export-dialog')).toBeInTheDocument();
    });
  });

  describe('Unsaved Changes Dialog (routeChangeStart)', () => {
    let routeChangeStartCallback: ((newPath: string) => void) | null = null;

    beforeEach(() => {
      routeChangeStartCallback = null;
      // Capture the event handler when it's registered
      mockRouterEventsOn.mockImplementation((event, callback) => {
        if (event === 'routeChangeStart') {
          routeChangeStartCallback = callback;
        }
      });
      mockUseAnimationConfigValues.isDirty = true; // Prerequisite for the dialog
    });

    it.skip('should show UnsavedChangesDialog on routeChangeStart if dirty', () => {
      renderPlaygroundPage();
      expect(routeChangeStartCallback).not.toBeNull();

      act(() => {
        try {
          if (routeChangeStartCallback) routeChangeStartCallback('/new-path');
        } catch (e) {
          // Expected to throw to stop navigation
          expect(e).toBe(
            'Navigation halted by user due to unsaved changes; custom dialog pending.'
          );
        }
      });

      // Re-render might be needed if dialog visibility is controlled by state updated in the callback
      renderPlaygroundPage(); // This re-render will use the updated mock values if any state in page changed
      expect(
        screen.getByTestId('mock-unsaved-changes-dialog')
      ).toBeInTheDocument();
    });

    it.skip('onConfirmLeave should push to pending path and close dialog', async () => {
      renderPlaygroundPage();
      const user = userEvent.setup();
      expect(routeChangeStartCallback).not.toBeNull();

      act(() => {
        try {
          if (routeChangeStartCallback)
            routeChangeStartCallback('/new-path-confirm');
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (e) {}
      });
      // Dialog should be open now.
      const confirmButton = screen.getByText('Confirm Leave'); // From mock
      await user.click(confirmButton);

      expect(mockRouterPush).toHaveBeenCalledWith('/new-path-confirm');
      // Verify dialog closes (by checking it's not in document after state update)
      // This requires PlaygroundPage's state to have changed.
      // We expect onConfirmLeave to set showUnsavedDialog to false.
      await waitFor(() => {
        expect(
          screen.queryByTestId('mock-unsaved-changes-dialog')
        ).not.toBeInTheDocument();
      });
    });

    it.skip('onCancel should close dialog and not navigate', async () => {
      renderPlaygroundPage();
      const user = userEvent.setup();
      expect(routeChangeStartCallback).not.toBeNull();

      act(() => {
        try {
          if (routeChangeStartCallback)
            routeChangeStartCallback('/new-path-cancel');
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (e) {}
      });
      // Dialog should be open.
      const cancelButton = screen.getByText('Cancel Leave'); // From mock
      await user.click(cancelButton);

      expect(mockRouterPush).not.toHaveBeenCalled();
      // Verify dialog closes
      await waitFor(() => {
        expect(
          screen.queryByTestId('mock-unsaved-changes-dialog')
        ).not.toBeInTheDocument();
      });
    });
  });

  describe('Prop Passing to Child Components', () => {
    it('should pass correct props to AnimationPreview', () => {
      mockUseAnimationConfigValues.configId = 'current-config-id';
      mockUseAnimationConfigValues.animationConfig = {
        name: 'Preview Config',
        type: 'slide',
      } as unknown;
      renderPlaygroundPage();
      const previewMock = screen.getByTestId('mock-animation-preview');
      expect(previewMock).toHaveAttribute('data-configid', 'current-config-id');
      expect(previewMock).toHaveAttribute('data-configname', 'Preview Config');
      // Test that onShare and onExport are wired to the hook's handlers
      // This is implicitly tested by the dialog opening tests above.
    });

    it('should pass correct props to ConfigPanel (writable mode)', async () => {
      mockUseAnimationConfigValues.animationConfig = {
        name: 'Initial For Panel',
        type: 'bounce',
      } as unknown;
      mockUseAnimationConfigValues.isReadOnly = false;
      renderPlaygroundPage();

      const panelMock = screen.getByTestId('mock-config-panel');
      expect(panelMock).toHaveAttribute(
        'data-initialconfigname',
        'Initial For Panel'
      );
      expect(panelMock).toHaveAttribute('data-isreadonly', 'false');
      expect(panelMock).toHaveAttribute('data-savebuttontext', 'Save');

      // Test callbacks (interaction part)
      const user = userEvent.setup();
      const mockConfigChangeButton = screen.getByText('Mock ConfigChange');
      await act(() => user.click(mockConfigChangeButton));
      expect(
        mockUseAnimationConfigValues.setAnimationConfig
      ).toHaveBeenCalled();

      const mockSaveButton = screen.getByText('Mock Save');
      await act(() => user.click(mockSaveButton));
      expect(mockUseAnimationConfigValues.saveConfig).toHaveBeenCalled();

      const mockResetButton = screen.getByText('Mock Reset');
      await act(() => user.click(mockResetButton));
      expect(mockUseAnimationConfigValues.resetConfig).toHaveBeenCalled();
    });

    it('should pass correct props to ConfigPanel (read-only mode)', async () => {
      mockUseAnimationConfigValues.animationConfig = {
        name: 'Read Only Panel',
        type: 'scale',
      } as unknown;
      mockUseAnimationConfigValues.isReadOnly = true;
      // saveButtonText in read-only is handled by ConfigPanel's internal logic if not overridden by prop
      renderPlaygroundPage();

      const panelMock = screen.getByTestId('mock-config-panel');
      expect(panelMock).toHaveAttribute(
        'data-initialconfigname',
        'Read Only Panel'
      );
      expect(panelMock).toHaveAttribute('data-isreadonly', 'true');
      // Check default saveButtonText for read-only or specific if passed
      // The mock passes 'Save' if saveButtonText is not specified, ConfigPanel makes it "Save as my configuration"
      // If saveButtonText *is* specified, it uses that.
      // The mock for ConfigPanel receives the saveButtonText prop.
      expect(panelMock).toHaveAttribute(
        'data-savebuttontext',
        'Save as my configuration'
      );

      // Verify onSave is still wired up for "Save as my configuration"
      const user = userEvent.setup();
      const mockSaveButton = screen.getByText('Mock Save'); // Button text from mock ConfigPanel
      await act(async () => await user.click(mockSaveButton)); // Simulates click on "Save as my configuration"
      expect(mockUseAnimationConfigValues.copyConfig).toHaveBeenCalled(); // copyConfig for read-only save action
      expect(mockUseAnimationConfigValues.saveConfig).not.toHaveBeenCalled(); // saveConfig should not be called in read-only mode
    });
  });
});
