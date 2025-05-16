import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';

import {
  DEFAULT_ANIMATION_CONFIG,
  useAnimationConfig,
} from '@/app/(main)/playground/hooks/useAnimationConfig';

import { mocks } from '../../vitest.setup';

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
    vi.clearAllMocks();
    (global.fetch as Mock).mockReset();
    mockConfigId = null;
    mockPush.mockReset();
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
            description: 'Your configuration has been saved successfully.',
          })
        );
      });

      it('should handle API error during saveConfig and show error toast', async () => {
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
      expect(result.current.configId).toBe(mockConfigId);
      expect(result.current.configTitle).toBe('Fetched Slide Animation');
      expect(mockShowToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Configuration Loaded',
          variant: 'success',
        })
      );
      expect(result.current.error).toBeNull();
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
      // Now expect error to be set
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
      // Now expect error to be set
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
      await waitFor(() => expect(result.current.loading).toBe(false)); // Wait for fetch attempt
      // Now expect error to be set
      expect(result.current.error).toBe('Failed to parse configuration data');
      expect(result.current.animationConfig.name).toBe('');
      expect(result.current.animationConfig.description).toBe('');
      expect(result.current.animationConfig.type).toBe(
        DEFAULT_ANIMATION_CONFIG.type
      );
      expect(result.current.configLoaded).toBe(true);
      expect(mockShowToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Error',
          description: 'Failed to parse configuration data',
          variant: 'error',
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

      const { useAnimationConfig: useAnimationConfigForReset } =
        await vi.importActual<
          typeof import('@/app/(main)/playground/hooks/useAnimationConfig')
        >('@/app/(main)/playground/hooks/useAnimationConfig');
      const { result } = renderHook(() => useAnimationConfigForReset());

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
        data: { session: { user: { id: 'copier-user-id' } } as any },
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
      expect(mockShowToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Configuration Saved',
          variant: 'success',
        })
      );
    });
  });
});
