// src/app/(main)/playground/hooks/useShareExport.test.ts
import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { useShareExport } from '@/app/(main)/playground/hooks/useShareExport';
import * as animationUtils from '@/app/utils/animations'; // To mock generate functions

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
  const sampleAnimationConfig = { type: 'fade', duration: 1 } as any; // Cast as any for simplicity

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
      // @ts-ignore
      delete window.location;
      // @ts-ignore
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

      window.location = originalLocation; // Restore original location
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
      (animationUtils.generateReactComponent as vi.Mock).mockReturnValue(
        mockReactCode
      );
      mockWriteText.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useShareExport(null));
      act(() => {
        result.current.setExportTab('react');
      }); // Ensure correct tab

      await act(async () => {
        await result.current.handleCopyCode(sampleAnimationConfig);
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
      (animationUtils.generateCSSCode as vi.Mock).mockReturnValue(mockCssCode);
      mockWriteText.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useShareExport(null));
      act(() => {
        result.current.setExportTab('css');
      });

      await act(async () => {
        await result.current.handleCopyCode(sampleAnimationConfig);
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
        result.current.handleCopyCode(sampleAnimationConfig);
      });

      expect(result.current.error).toBe('Unknown export type');
      expect(mockWriteText).not.toHaveBeenCalled();
    });

    it('should set error if clipboard write fails for code', async () => {
      (animationUtils.generateReactComponent as vi.Mock).mockReturnValue(
        '<Animate />'
      );
      mockWriteText.mockRejectedValueOnce(new Error('Clipboard error'));
      const { result } = renderHook(() => useShareExport(null));

      await act(async () => {
        await result.current.handleCopyCode(sampleAnimationConfig);
      });
      expect(result.current.error).toBe('Failed to copy code to clipboard');
      expect(result.current.copySuccess).toBe(false);
    });
  });
});
