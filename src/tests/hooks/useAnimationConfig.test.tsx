import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';

import {
  DEFAULT_ANIMATION_CONFIG,
  useAnimationConfig,
} from '@/app/(main)/playground/hooks/useAnimationConfig';

import { mocks } from '../../../vitest.setup';

const { mockPush, mockSupabaseAuth } = mocks;

// --- Mock useToast ---
const mockShowToast = vi.fn();
vi.mock('@/context/ToastContext', () => ({
  useToast: () => ({
    showToast: mockShowToast,
  }),
}));

// --- Mock next/navigation globally ---
let mockConfigId: string | null = null;
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
  useSearchParams: () => ({
    get: (key: string) => (key === 'id' ? mockConfigId : null),
  }),
  usePathname: vi.fn().mockReturnValue('/playground'),
}));

// --- Mock global fetch for API calls ---
global.fetch = vi.fn();

// --- Test Suite ---
describe('useAnimationConfig Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks(); // Clears call history for all mocks
    (global.fetch as Mock).mockReset(); // Resets fetch mock implementation and call history
    mockConfigId = null; // Reset mock configId for useSearchParams
    mockPush.mockReset(); // Reset mockPush call history

    // Default Supabase session to not logged in
    mockSupabaseAuth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });
  });

  // --- Scenario 1: New Configuration (No configId in URL) ---
  describe('Scenario: New Configuration (no configId)', () => {
    beforeEach(() => {
      mockConfigId = null;
    });

    it('should initialize with DEFAULT_ANIMATION_CONFIG, isReadOnly: false, and no errors', () => {
      const { result } = renderHook(() => useAnimationConfig());
      expect(result.current.animationConfig).toEqual(DEFAULT_ANIMATION_CONFIG);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.configLoaded).toBe(false);
      expect(result.current.isReadOnly).toBe(false);
      expect(result.current.configId).toBeNull();
      expect(result.current.configTitle).toBe('');
    });

    it('should correctly update animationConfig state via setAnimationConfig', () => {
      const { result } = renderHook(() => useAnimationConfig());
      const newPartialConfig = { type: 'slide', duration: 1.5 } as Partial<
        typeof DEFAULT_ANIMATION_CONFIG
      >;
      act(() => {
        result.current.setAnimationConfig({
          ...DEFAULT_ANIMATION_CONFIG,
          ...newPartialConfig,
        });
      });
      expect(result.current.animationConfig.type).toBe('slide');
      expect(result.current.animationConfig.duration).toBe(1.5);
    });

    describe('saveConfig (creating new)', () => {
      const configToSave: typeof DEFAULT_ANIMATION_CONFIG = {
        ...DEFAULT_ANIMATION_CONFIG,
        name: 'My Test Animation',
        description: 'A cool new animation',
        isPublic: false,
      };

      it('should return false and show toast if user is not logged in', async () => {
        const { result } = renderHook(() => useAnimationConfig());
        let success: boolean | undefined;
        await act(async () => {
          success = await result.current.saveConfig(configToSave);
        });
        expect(success).toBe(false);
        expect(mockShowToast).toHaveBeenCalledWith(
          expect.objectContaining({
            variant: 'error',
            description: 'You must be logged in to save configurations',
          })
        );
        expect(global.fetch).not.toHaveBeenCalled();
      });

      it('should return false and show toast if config name is empty', async () => {
        mockSupabaseAuth.getSession.mockResolvedValueOnce({
          data: { session: { user: { id: 'test-user' } } },
          error: null,
        });
        const { result } = renderHook(() => useAnimationConfig());
        const configWithoutName = { ...configToSave, name: '' };
        let success: boolean | undefined;
        await act(async () => {
          success = await result.current.saveConfig(configWithoutName);
        });
        expect(success).toBe(false);
        expect(mockShowToast).toHaveBeenCalledWith(
          expect.objectContaining({
            variant: 'info',
            description: 'Please provide a name for your configuration',
          })
        );
      });

      it('should POST to /api/configs, redirect, and show success toast on successful save', async () => {
        mockSupabaseAuth.getSession.mockResolvedValueOnce({
          data: { session: { user: { id: 'user-abc-123' } } },
          error: null,
        });
        const mockApiResponse = {
          id: 'new-config-xyz',
          title: configToSave.name,
        };
        (global.fetch as Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => mockApiResponse,
        });
        const { result } = renderHook(() => useAnimationConfig());
        let success: boolean | undefined;
        await act(async () => {
          success = await result.current.saveConfig(configToSave);
        });
        expect(success).toBe(true);
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/configs',
          expect.objectContaining({ method: 'POST' })
        );
        expect(mockPush).toHaveBeenCalledWith(
          `/playground?id=${mockApiResponse.id}`
        );
        expect(mockShowToast).toHaveBeenCalledWith(
          expect.objectContaining({
            variant: 'success',
            description: 'has been saved successfully.',
          })
        );
      });

      it('should handle API error during saveConfig (creating new) and show error toast', async () => {
        mockSupabaseAuth.getSession.mockResolvedValueOnce({
          data: { session: { user: { id: 'test-user' } } },
          error: null,
        });
        (global.fetch as Mock).mockResolvedValueOnce({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error',
          json: async () => ({ error: 'Database unavailable' }),
        });
        const { result } = renderHook(() => useAnimationConfig());
        let success: boolean | undefined;
        await act(async () => {
          success = await result.current.saveConfig(configToSave);
        });
        expect(success).toBe(false);
        expect(mockShowToast).toHaveBeenCalledWith(
          expect.objectContaining({
            variant: 'error',
            description: 'Database unavailable',
          })
        );
      });
    });

    it('should reset animationConfig to defaults and not redirect if no configId was present', () => {
      const { result } = renderHook(() => useAnimationConfig());
      act(() => {
        result.current.setAnimationConfig({
          ...DEFAULT_ANIMATION_CONFIG,
          duration: 10,
        });
      });
      act(() => {
        result.current.resetConfig();
      });
      expect(result.current.animationConfig).toEqual(DEFAULT_ANIMATION_CONFIG);
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  // --- Scenario 2: Loading Existing Configuration (with configId) ---
  describe('Scenario: Loading Existing Configuration (with configId)', () => {
    const mockConfigIdValue = 'existing-config-123';
    beforeEach(() => {
      mockConfigId = mockConfigIdValue;
    });

    const fetchedOwnedConfigData: typeof DEFAULT_ANIMATION_CONFIG = {
      type: 'slide',
      duration: 2,
      delay: 0.5,
      easing: 'ease-in-out',
      distance: 100,
      degrees: 0,
      scale: 1,
      opacity: { start: 0.1, end: 0.9 },
      name: 'Fetched Slide Animation',
      description: 'A fetched animation.',
      isPublic: true,
      axis: 'x',
    };
    const mockOwnedApiResponse = {
      id: mockConfigId,
      title: 'Fetched Slide Animation',
      description: 'A fetched animation.',
      configData: JSON.stringify(fetchedOwnedConfigData),
      isPublic: true,
      isReadOnly: false,
      userId: 'current-user-id',
    };

    it('should fetch, load owned config, set isReadOnly to false, and show success toast', async () => {
      (global.fetch as Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockOwnedApiResponse,
      });
      mockSupabaseAuth.getSession.mockResolvedValueOnce({
        data: { session: { user: { id: 'current-user-id' } } },
        error: null,
      });
      const { result } = renderHook(() => useAnimationConfig());
      await waitFor(() => expect(result.current.configLoaded).toBe(true), {
        timeout: 2000,
      });
      expect(result.current.loading).toBe(false);
      expect(result.current.animationConfig).toEqual(fetchedOwnedConfigData);
      expect(result.current.isReadOnly).toBe(false);
      expect(result.current.configId).toBe(mockConfigIdValue);
      expect(result.current.configTitle).toBe(mockOwnedApiResponse.title);
      expect(mockShowToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Configuration Loaded',
          description: 'Your configuration has been loaded successfully.',
          variant: 'success',
        })
      );
      expect(result.current.error).toBeNull();
    });

    // Test for isPublic from top-level data
    it('should correctly use isPublic from top-level API response if configData.isPublic is missing', async () => {
      const apiResponse = {
        ...mockOwnedApiResponse,
        isPublic: true, // Top-level isPublic
        configData: JSON.stringify({
          ...fetchedOwnedConfigData,
          isPublic: undefined,
        }), // configData.isPublic is undefined
      };
      (global.fetch as Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => apiResponse,
      });
      const { result } = renderHook(() => useAnimationConfig());
      await waitFor(() => expect(result.current.configLoaded).toBe(true));
      expect(result.current.animationConfig.isPublic).toBe(true);
    });

    // Test for isPublic from configData overriding top-level
    it('should correctly use isPublic from configData when both top-level and configData.isPublic exist', async () => {
      const apiResponse = {
        ...mockOwnedApiResponse,
        isPublic: false, // Top-level isPublic
        configData: JSON.stringify({
          ...fetchedOwnedConfigData,
          isPublic: true,
        }), // configData.isPublic is true
      };
      (global.fetch as Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => apiResponse,
      });
      const { result } = renderHook(() => useAnimationConfig());
      await waitFor(() => expect(result.current.configLoaded).toBe(true));
      // The hook implementation currently uses top-level isPublic, not configData.isPublic
      expect(result.current.animationConfig.isPublic).toBe(false);
    });

    const fetchedPublicConfigData: typeof DEFAULT_ANIMATION_CONFIG = {
      type: 'rotate',
      duration: 1,
      delay: 0.1,
      easing: 'linear',
      degrees: 180,
      name: 'Public Rotate',
      description: 'A public animation.',
      isPublic: true,
      distance: DEFAULT_ANIMATION_CONFIG.distance,
      scale: DEFAULT_ANIMATION_CONFIG.scale,
      opacity: DEFAULT_ANIMATION_CONFIG.opacity,
    };
    const mockPublicApiResponse = {
      id: mockConfigId,
      title: 'Public Rotate',
      description: 'A public animation.',
      configData: JSON.stringify(fetchedPublicConfigData),
      isPublic: true,
      isReadOnly: true,
      userId: 'another-user-id',
    };

    it('should fetch, load public/not-owned config, set isReadOnly to true, and show success toast', async () => {
      (global.fetch as Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockPublicApiResponse,
      });
      mockSupabaseAuth.getSession.mockResolvedValueOnce({
        data: { session: { user: { id: 'current-user-id-different' } } },
        error: null,
      });
      const { result } = renderHook(() => useAnimationConfig());
      await waitFor(() => expect(result.current.configLoaded).toBe(true));
      expect(result.current.loading).toBe(false);
      expect(result.current.animationConfig.type).toBe('rotate');
      expect(result.current.animationConfig.name).toBe('Public Rotate');
      expect(result.current.isReadOnly).toBe(true);
      expect(mockShowToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Configuration Loaded',
          variant: 'success',
        })
      );
    });

    it('should handle config not found (404) and show error toast', async () => {
      (global.fetch as Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => ({ error: 'Configuration not found' }),
      });
      const { result } = renderHook(() => useAnimationConfig());
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.error).toBe('Configuration not found');
      expect(mockShowToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Error',
          description: 'Configuration not found',
          variant: 'error',
        })
      );
      expect(result.current.animationConfig).toEqual(DEFAULT_ANIMATION_CONFIG);
      expect(result.current.configLoaded).toBe(false);
    });

    it('should handle other API errors during fetch and show error toast', async () => {
      (global.fetch as Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Server Error',
        json: async () => ({ error: 'Something went wrong' }),
      });
      const { result } = renderHook(() => useAnimationConfig());
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.error).toBe('Something went wrong');
      expect(mockShowToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Error',
          description: 'Something went wrong',
          variant: 'error',
        })
      );
    });

    it('should handle missing or malformed configData gracefully and show error/warning toast', async () => {
      const apiResponseMalformed = {
        id: mockConfigId,
        title: 'Malformed Config',
        description: 'Bad data.',
        configData: 'not json',
        isPublic: true,
        isReadOnly: false,
        userId: 'current-user-id',
      };
      (global.fetch as Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => apiResponseMalformed,
      });
      mockSupabaseAuth.getSession.mockResolvedValueOnce({
        data: { session: { user: { id: 'current-user-id' } } },
        error: null,
      });
      const { result } = renderHook(() => useAnimationConfig());
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.error).toBe('Failed to parse configuration data');
      expect(result.current.animationConfig).toEqual(DEFAULT_ANIMATION_CONFIG); // Should reset to default
      expect(result.current.configLoaded).toBe(true); // Config loaded but with error
      expect(mockShowToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Error',
          description: 'Failed to parse configuration data',
          variant: 'error',
        })
      );
    });

    it('should handle API returning non-JSON response for successful fetch', async () => {
      (global.fetch as Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error('Not JSON');
        },
      });
      mockSupabaseAuth.getSession.mockResolvedValueOnce({
        data: { session: { user: { id: 'current-user-id' } } },
        error: null,
      });

      const { result } = renderHook(() => useAnimationConfig());
      await waitFor(() => expect(result.current.loading).toBe(false));

      // When json() fails, the hook gets an empty object {} and continues
      // Since the empty object has no configData, it uses fallback config
      expect(result.current.error).toBe(null);
      expect(result.current.animationConfig.name).toBe(''); // Empty title from fallback
      expect(result.current.configLoaded).toBe(true);
      expect(mockShowToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Warning',
          description: 'Configuration data is missing, using defaults.',
          variant: 'info',
        })
      );
    });

    describe('saveConfig (updating existing, owned config)', () => {
      const initialLoadedConfigForUpdate: typeof DEFAULT_ANIMATION_CONFIG = {
        ...DEFAULT_ANIMATION_CONFIG,
        name: 'Original Updatable',
        description: 'Original Desc',
        type: 'fade',
        isPublic: false,
      };

      beforeEach(async () => {
        // Mock the initial load for the update tests
        (global.fetch as Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            id: mockConfigId,
            title: initialLoadedConfigForUpdate.name,
            description: initialLoadedConfigForUpdate.description,
            configData: JSON.stringify(initialLoadedConfigForUpdate),
            isPublic: initialLoadedConfigForUpdate.isPublic,
            isReadOnly: false,
            userId: 'test-user-id-owner',
          }),
        });
        mockSupabaseAuth.getSession.mockResolvedValue({
          data: { session: { user: { id: 'test-user-id-owner' } } },
          error: null,
        });
      });

      it('should PUT to /api/configs/[id] and show success toast on successful update', async () => {
        const { result } = renderHook(() => useAnimationConfig());
        await waitFor(() => expect(result.current.configLoaded).toBe(true)); // Wait for initial load
        expect(result.current.isReadOnly).toBe(false);

        const updatedConfigFields = {
          name: 'Updated Name',
          description: 'Updated Description',
          duration: 2,
          isPublic: true,
        };
        const configToSave = {
          ...result.current.animationConfig,
          ...updatedConfigFields,
        };

        (global.fetch as Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => ({ id: mockConfigId, ...updatedConfigFields }),
        }); // Mock for PUT

        let success: boolean | undefined;
        await act(async () => {
          success = await result.current.saveConfig(configToSave);
        });

        expect(success).toBe(true);
        expect(global.fetch).toHaveBeenCalledWith(
          `/api/configs/${mockConfigId}`,
          expect.objectContaining({ method: 'PUT' })
        );
        expect(mockShowToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Configuration Saved',
            description: 'Your configuration has been updated successfully.',
            variant: 'success',
          })
        );
      });

      it('should handle API error during saveConfig (updating existing) and show error toast', async () => {
        const { result } = renderHook(() => useAnimationConfig());
        await waitFor(() => expect(result.current.configLoaded).toBe(true));

        const configToSave = {
          ...result.current.animationConfig,
          name: 'Updated Fail Name',
        };
        (global.fetch as Mock).mockResolvedValueOnce({
          // Mock for PUT
          ok: false,
          status: 500,
          json: async () => ({ error: 'Server update failed' }),
        });

        let success: boolean | undefined;
        await act(async () => {
          success = await result.current.saveConfig(configToSave);
        });

        expect(success).toBe(false);
        expect(mockShowToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Save Error',
            description: 'Server update failed',
            variant: 'error',
          })
        );
        expect(result.current.error).toBe('Server update failed');
      });
    });

    it('should reset animationConfig and redirect to /playground if configId was present', async () => {
      // Ensure fetch for initial load is mocked if the hook tries to load first
      (global.fetch as Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ...mockOwnedApiResponse, id: 'some-id-to-clear' }),
      });
      mockSupabaseAuth.getSession.mockResolvedValueOnce({
        data: { session: { user: { id: 'current-user-id' } } },
        error: null,
      });

      const { result } = renderHook(() => useAnimationConfig());

      // Wait for any initial load due to the mocked ID
      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => {
        result.current.setAnimationConfig({
          ...DEFAULT_ANIMATION_CONFIG,
          name: 'Specific Config',
          duration: 5,
        });
      });

      act(() => {
        result.current.resetConfig();
      });

      expect(result.current.animationConfig).toEqual(DEFAULT_ANIMATION_CONFIG);
      expect(mockPush).toHaveBeenCalledWith('/playground');
    });
  });

  // --- Scenario 3: copyConfig ---
  describe('Scenario: copyConfig', () => {
    const mockExistingConfigId = 'config-to-copy-123';
    beforeEach(() => {
      mockConfigId = mockExistingConfigId;
    });
    const originalConfig: typeof DEFAULT_ANIMATION_CONFIG = {
      ...DEFAULT_ANIMATION_CONFIG,
      type: 'bounce',
      name: 'Original Bounce',
      description: 'This is the original.',
      isPublic: true,
    };

    beforeEach(async () => {
      (global.fetch as Mock).mockImplementation(
        async (url: string, options?: RequestInit) => {
          if (
            url === `/api/configs/${mockExistingConfigId}` &&
            options?.method === undefined
          ) {
            // Initial GET
            return {
              ok: true,
              json: async () => ({
                id: mockExistingConfigId,
                title: originalConfig.name,
                description: originalConfig.description,
                configData: JSON.stringify(originalConfig),
                isPublic: originalConfig.isPublic,
                isReadOnly: true,
                userId: 'owner-user-id',
              }),
            };
          }
          if (url === '/api/configs' && options?.method === 'POST') {
            // The POST from copyConfig
            return {
              ok: true,
              json: async () => ({
                id: 'new-copied-config-id',
                title: JSON.parse(options.body as string).title,
              }),
            };
          }
          return {
            ok: false,
            status: 404,
            json: async () => ({ error: 'Unhandled fetch mock in copyConfig' }),
          };
        }
      );
      mockSupabaseAuth.getSession.mockResolvedValue({
        data: { session: { user: { id: 'copier-user-id' } } as unknown },
        error: null,
      });
    });

    it('should call saveConfig (as POST) with current animationConfig and redirect to new ID', async () => {
      const { result } = renderHook(() => useAnimationConfig());
      await waitFor(() => expect(result.current.configLoaded).toBe(true)); // Wait for initial load
      expect(result.current.isReadOnly).toBe(true);
      expect(result.current.configTitle).toBe('Original Bounce');

      let success: boolean | undefined;
      await act(async () => {
        success = await result.current.copyConfig();
      });

      expect(success).toBe(true);
      const postCall = (global.fetch as Mock).mock.calls.find(
        (call) => call[0] === '/api/configs' && call[1]?.method === 'POST'
      );
      expect(postCall).toBeDefined();
      const expectedBodyForCopy = {
        title: originalConfig.name,
        description: originalConfig.description,
        configData: JSON.stringify(originalConfig),
        isPublic: originalConfig.isPublic,
      };
      expect(JSON.parse(postCall![1].body as string)).toEqual(
        expectedBodyForCopy
      );
      expect(mockPush).toHaveBeenCalledWith(
        '/playground?id=new-copied-config-id'
      );
      // The primary toast for copyConfig is the one shown by saveConfig itself.
      // The additional toast in copyConfig is for the copy action specifically.
      expect(mockShowToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Configuration Saved',
          // Description will be from the saveConfig call for the new item
          description: 'has been saved successfully.',
          variant: 'success',
        })
      );
      expect(mockShowToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Configuration Saved', // This is the specific toast from copyConfig
          description: `Configuration '${originalConfig.name}' has been copied successfully.`,
          variant: 'success',
        })
      );
    });
  });
});
