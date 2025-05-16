// vitest.setup.ts
import { cleanup } from '@testing-library/react';
import { vi, afterEach, beforeEach } from 'vitest';

// --- Mocks for Next.js Navigation ---
const mockPush = vi.fn();
const mockReplace = vi.fn();
const mockRefresh = vi.fn();

// --- Mocks for Supabase Auth Methods (single source of truth) ---
// This object will be used by the mock factory and by the tests for assertions.
export const mockSupabaseAuth = {
  signUp: vi.fn(),
  signInWithPassword: vi.fn(),
  signInWithOAuth: vi.fn(),
  resetPasswordForEmail: vi.fn(),
  signOut: vi.fn(),
  getSession: vi.fn(), // Crucial for useAnimationConfig
  getUser: vi.fn(), // Often used for auth state
  onAuthStateChange: vi.fn(() => ({
    // Mock onAuthStateChange
    data: { subscription: { unsubscribe: vi.fn() } },
  })),
};

// Mock next/navigation
vi.mock('next/navigation', async (importOriginal) => {
  const actual = await importOriginal<typeof import('next/navigation')>();
  return {
    ...actual,
    useRouter: () => ({
      push: mockPush,
      replace: mockReplace,
      refresh: mockRefresh,
    }),
    useSearchParams: () => ({
      get: vi.fn((key: string) => {
        // Default behavior for useAnimationConfig tests (no 'id' initially)
        if (key === 'id') return null;
        return null; // Default for other params
      }),
    }),
    usePathname: vi.fn().mockReturnValue('/playground'), // Default pathname
    useParams: vi.fn().mockReturnValue({}),
  };
});

// Mock the primary supabase client factory
// This is the module imported by useAuth.ts and useAnimationConfig.ts
vi.mock('@/app/utils/supabase/client', () => ({
  createClient: vi.fn(() => {
    // This factory function is called when `createClient()` is used in the hooks
    return {
      auth: mockSupabaseAuth, // Ensure this returns the shared mockSupabaseAuth object
    };
  }),
}));

// --- Global Test Setup ---
beforeEach(() => {
  vi.clearAllMocks(); // Clears call history and resets implementations for ALL mocks

  // Reset default SUCCESSFUL return values for Supabase Auth mocks
  mockSupabaseAuth.signUp.mockResolvedValue({
    data: { user: { id: 'mock-user-id-signup' }, session: null },
    error: null,
  });
  mockSupabaseAuth.signInWithPassword.mockResolvedValue({
    data: { user: { id: 'mock-user-id-signin' }, session: {} as any },
    error: null,
  });
  mockSupabaseAuth.signInWithOAuth.mockResolvedValue({
    data: { provider: 'google', url: 'mock-oauth-url' } as any,
    error: null,
  });
  mockSupabaseAuth.resetPasswordForEmail.mockResolvedValue({
    data: {} as any,
    error: null,
  });
  mockSupabaseAuth.signOut.mockResolvedValue({ error: null });
  mockSupabaseAuth.getSession.mockResolvedValue({
    data: { session: null },
    error: null,
  }); // Default: no active session
  mockSupabaseAuth.getUser.mockResolvedValue({
    data: { user: null },
    error: null,
  }); // Default: no user

  (
    mockSupabaseAuth.onAuthStateChange as ReturnType<typeof vi.fn>
  ).mockReturnValue({
    data: { subscription: { unsubscribe: vi.fn() } },
  } as any);
});

afterEach(() => {
  cleanup();
});

// Export for tests to import and use for assertions
export const mocks = {
  mockPush,
  mockReplace,
  mockRefresh,
  mockSupabaseAuth, // This is the object tests should import
};
