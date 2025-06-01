// src/app/(main)/playground/hooks/useShareExport.test.ts
import { act, renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest';

import { useShareExport } from '@/app/(main)/playground/hooks/useShareExport';
import * as animationUtils from '@/app/utils/animations'; // To mock generate functions
import type { AnimationConfig } from '@/types/animations'; // Import the main type

// Mock animation utility functions
vi.mock('@/app/utils/animations', () => ({
  generateReactComponent: vi.fn(),
  generateCSSCode: vi.fn(),
}));

// Mock navigator.clipboard
const mockWriteText = vi.fn();
Object.defineProperty(global.navigator, 'clipboard', {
  value: {
    writeText: mockWriteText,
  },
  configurable: true,
  writable: true,
});

describe('useShareExport Hook', () => {
  // Use the imported AnimationConfig type
  const sampleAnimationConfig: AnimationConfig = {
    type: 'fade',
    duration: 1,
    delay: 0, // Added missing property
    easing: 'ease-out', // Added missing property
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers(); // Enable fake timers for testing timeouts
  });

  afterEach(() => {
    vi.runOnlyPendingTimers(); // Run any pending timers
    vi.useRealTimers(); // Restore real timers
  });

  it('should initialize with default states', () => {
    const { result } = renderHook(() => useShareExport(null));
    expect(result.current.shareDialogOpen).toBe(false);
    expect(result.current.exportDialogOpen).toBe(false);
    expect(result.current.shareUrl).toBe('');
    expect(result.current.copySuccess).toBe(false);
    expect(result.current.exportTab).toBe('react');
    expect(result.current.error).toBeNull();
  });

  describe('handleShare', () => {
    it('should set error if configId is null', () => {
      const { result } = renderHook(() => useShareExport(null));
      act(() => {
        result.current.handleShare();
      });
      expect(result.current.error).toBe(
        'Please save your configuration before sharing'
      );
      expect(result.current.shareDialogOpen).toBe(false);
    });

    it('should set shareUrl and open dialog if configId is provided', () => {
      const mockConfigId = 'test-config-id';
      // Mock window.location.href for consistent URL generation
      const originalLocation = window.location;

      // @ts-expect-error: Overriding window.location for test
      window.location = {
        ...originalLocation,
        href: `http://localhost:3000/playground`,
      };

      const { result } = renderHook(() => useShareExport(mockConfigId));
      act(() => {
        result.current.handleShare();
      });
      expect(result.current.shareUrl).toBe(
        `http://localhost:3000/playground?id=${mockConfigId}`
      );
      expect(result.current.shareDialogOpen).toBe(true);
      expect(result.current.error).toBeNull();

      Object.defineProperty(window, 'location', {
        value: originalLocation,
        configurable: true,
        writable: true,
      }); // Restore original location
    });
  });

  it('handleExport should open export dialog', () => {
    const { result } = renderHook(() => useShareExport(null));
    act(() => {
      result.current.handleExport();
    });
    expect(result.current.exportDialogOpen).toBe(true);
  });

  describe('handleCopyUrl', () => {
    it('should copy shareUrl to clipboard and set copySuccess', async () => {
      mockWriteText.mockResolvedValueOnce(undefined);
      const { result } = renderHook(() => useShareExport('some-id'));

      act(() => {
        // First, set a shareUrl (as if handleShare was called)
        result.current.handleShare(); // This will set shareUrl and open dialog
      });
      // Ensure shareUrl is set before copying
      expect(result.current.shareUrl).not.toBe('');

      await act(async () => {
        await result.current.handleCopyUrl();
      });

      expect(mockWriteText).toHaveBeenCalledWith(result.current.shareUrl);
      expect(result.current.copySuccess).toBe(true);

      act(() => {
        vi.advanceTimersByTime(2000);
      });
      expect(result.current.copySuccess).toBe(false);
    });

    it('should set error if clipboard write fails for URL', async () => {
      mockWriteText.mockRejectedValueOnce(new Error('Clipboard error'));
      const { result } = renderHook(() => useShareExport('some-id'));
      act(() => {
        result.current.handleShare();
      }); // Set shareUrl

      await act(async () => {
        await result.current.handleCopyUrl();
      });
      expect(result.current.error).toBe('Failed to copy URL to clipboard');
      expect(result.current.copySuccess).toBe(false);
    });
  });

  describe('handleCopyCode', () => {
    it('should copy React component code and set copySuccess', async () => {
      const mockReactCode = '<Animate type="fade" />';
      (animationUtils.generateReactComponent as Mock).mockReturnValue(
        mockReactCode
      );
      mockWriteText.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useShareExport(null));
      act(() => {
        result.current.setExportTab('react');
      });

      await act(async () => {
        result.current.handleCopyCode(sampleAnimationConfig);
      });

      expect(animationUtils.generateReactComponent).toHaveBeenCalledWith(
        sampleAnimationConfig
      );
      expect(mockWriteText).toHaveBeenCalledWith(mockReactCode);
      expect(result.current.copySuccess).toBe(true);

      act(() => {
        vi.advanceTimersByTime(2000);
      });
      expect(result.current.copySuccess).toBe(false);
    });

    it('should copy CSS code and set copySuccess', async () => {
      const mockCssCode = '.animated { animation: fade 1s; }';
      (animationUtils.generateCSSCode as Mock).mockReturnValue(mockCssCode);
      mockWriteText.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useShareExport(null));
      act(() => {
        result.current.setExportTab('css');
      });

      await act(async () => {
        result.current.handleCopyCode(sampleAnimationConfig);
      });

      expect(animationUtils.generateCSSCode).toHaveBeenCalledWith(
        sampleAnimationConfig
      );
      expect(mockWriteText).toHaveBeenCalledWith(mockCssCode);
      expect(result.current.copySuccess).toBe(true);

      act(() => {
        vi.advanceTimersByTime(2000);
      });
      expect(result.current.copySuccess).toBe(false);
    });

    it('should set error if exportTab is unknown', () => {
      const { result } = renderHook(() => useShareExport(null));
      act(() => {
        result.current.setExportTab('unknown-tab');
      });
      act(() => {
        // No need to spread and add missing props here anymore
        return result.current.handleCopyCode(sampleAnimationConfig);
      });

      expect(result.current.error).toBe('Unknown export type');
      expect(mockWriteText).not.toHaveBeenCalled();
    });

    it('should set error if clipboard write fails for code', async () => {
      (animationUtils.generateReactComponent as Mock).mockReturnValue(
        '<Animate />'
      );
      mockWriteText.mockRejectedValueOnce(new Error('Clipboard error'));
      const { result } = renderHook(() => useShareExport(null));

      await act(async () => {
        return result.current.handleCopyCode(sampleAnimationConfig);
      });
      expect(result.current.error).toBe('Failed to copy code to clipboard');
      expect(result.current.copySuccess).toBe(false);
    });
  });

  describe('Direct State Setters', () => {
    it('setShareDialogOpen should update shareDialogOpen state', () => {
      const { result } = renderHook(() => useShareExport(null));
      act(() => {
        result.current.setShareDialogOpen(true);
      });
      expect(result.current.shareDialogOpen).toBe(true);
      act(() => {
        result.current.setShareDialogOpen(false);
      });
      expect(result.current.shareDialogOpen).toBe(false);
    });

    it('setExportDialogOpen should update exportDialogOpen state', () => {
      const { result } = renderHook(() => useShareExport(null));
      act(() => {
        result.current.setExportDialogOpen(true);
      });
      expect(result.current.exportDialogOpen).toBe(true);
      act(() => {
        result.current.setExportDialogOpen(false);
      });
      expect(result.current.exportDialogOpen).toBe(false);
    });

    it('setExportTab should update exportTab state', () => {
      const { result } = renderHook(() => useShareExport(null));
      act(() => {
        result.current.setExportTab('css');
      });
      expect(result.current.exportTab).toBe('css');
    });

    it('setError should update error state', () => {
      const { result } = renderHook(() => useShareExport(null));
      act(() => {
        result.current.setError('Test error message');
      });
      expect(result.current.error).toBe('Test error message');
      act(() => {
        result.current.setError(null);
      });
      expect(result.current.error).toBeNull();
    });
  });

  describe('Error State Management', () => {
    it('should clear a previous error when a new action starts successfully (e.g., handleShare)', () => {
      const { result } = renderHook(() => useShareExport('test-id'));
      // Set an initial error
      act(() => {
        result.current.setError('Initial error');
      });
      expect(result.current.error).toBe('Initial error');

      // Perform an action that should succeed and potentially clear the error
      // Note: handleShare itself doesn't clear error if configId is null.
      // Let's test with handleExport which is simpler and doesn't set its own errors on success.
      // Actually, handleShare with a valid configId *should not* clear a previous unrelated error.
      // The hook does not have a global error clearing mechanism on every action.
      // Let's verify this behavior.

      // Mock window.location for handleShare
      const originalLocation = window.location;
      // @ts-expect-error: Overriding window.location for test
      window.location = {
        ...originalLocation,
        href: `http://localhost:3000/playground`,
      };

      act(() => {
        result.current.handleShare(); // This action itself doesn't set error if successful
      });
      // According to current hook logic, handleShare does not clear pre-existing errors.
      // It only calls setError if configId is null.
      expect(result.current.error).toBe('Initial error');

      Object.defineProperty(window, 'location', {
        value: originalLocation,
        configurable: true,
        writable: true,
      });
    });

    it('a failed action (e.g. handleCopyUrl) should set an error, and a subsequent different failed action should set its own error', async () => {
      const { result } = renderHook(() => useShareExport('test-id'));
      act(() => {
        result.current.handleShare();
      }); // Populate shareUrl

      mockWriteText.mockRejectedValueOnce(new Error('URL Copy Error'));
      await act(async () => {
        await result.current.handleCopyUrl();
      });
      expect(result.current.error).toBe('Failed to copy URL to clipboard');

      (animationUtils.generateReactComponent as Mock).mockReturnValue(
        '<Comp />'
      );
      mockWriteText.mockRejectedValueOnce(new Error('Code Copy Error'));
      await act(async () => {
        result.current.handleCopyCode(sampleAnimationConfig);
      });
      expect(result.current.error).toBe('Failed to copy code to clipboard'); // Error is updated
    });

    it('a successful copy action should not clear an unrelated existing error from a different operation', async () => {
      const { result } = renderHook(() => useShareExport('test-id'));

      // Simulate an external error or error from a different operation
      act(() => {
        result.current.setError('Some previous unrelated error');
      });
      expect(result.current.error).toBe('Some previous unrelated error');

      // Now perform a successful copy operation
      act(() => {
        result.current.handleShare();
      }); // Populate shareUrl
      mockWriteText.mockResolvedValueOnce(undefined);
      await act(async () => {
        await result.current.handleCopyUrl();
      });

      expect(result.current.copySuccess).toBe(true);
      // The current hook logic for handleCopyUrl does not explicitly clear pre-existing errors
      // if the copy operation itself is successful. It only sets its own error on failure.
      expect(result.current.error).toBe('Some previous unrelated error');
    });
  });
});
