// Import the necessary testing utilities
import { cleanup } from '@testing-library/react';
import { vi } from 'vitest';
import { afterEach, beforeEach } from 'vitest';

// --- Mocks for Next.js Navigation ---
const mockPush = vi.fn();
const mockReplace = vi.fn();

// --- Mocks for Supabase Auth Methods ---
const mockSupabaseAuth = {
  signUp: vi.fn(),
  signInWithPassword: vi.fn(),
  signInWithOAuth: vi.fn(),
  resetPasswordForEmail: vi.fn(),
  signOut: vi.fn(),
  getSession: vi.fn(),
};

// --- Mock Implementations ---

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
  useSearchParams: () => ({
    get: vi.fn(),
  }),
  usePathname: vi.fn().mockReturnValue('/'),
  useParams: vi.fn().mockReturnValue({}),
}));

// Mock Supabase client creator
// IMPORTANT: This mock ensures that `createClient()` returns the `mockSupabaseAuth` object.
vi.mock('@/utils/supabase/client', () => ({
  createClient: () => ({
    auth: mockSupabaseAuth,
  }),
}));

// --- Global Test Setup ---

// Set up default mock behaviors and reset mocks before each test
beforeEach(() => {
  // Clear call history and reset implementations for ALL mocks
  vi.clearAllMocks();

  // Set default SUCCESSFUL return values for Supabase Auth mocks
  // Tests needing specific error cases will override these using .mockResolvedValueOnce / .mockRejectedValueOnce
  mockSupabaseAuth.signUp.mockResolvedValue({
    data: { user: { id: 'mock-user-id-signup' }, session: null },
    error: null,
  });
  mockSupabaseAuth.signInWithPassword.mockResolvedValue({
    data: { user: { id: 'mock-user-id-signin' }, session: {} },
    error: null,
  });
  mockSupabaseAuth.signInWithOAuth.mockResolvedValue({
    data: { url: 'mock-oauth-url' },
    error: null,
  });
  mockSupabaseAuth.resetPasswordForEmail.mockResolvedValue({
    data: { data: { mail: '' } },
    error: null,
  });
  mockSupabaseAuth.signOut.mockResolvedValue({
    error: null,
  });
  mockSupabaseAuth.getSession.mockResolvedValue({
    data: { session: null },
    error: null,
  });
});

// Clean up React components after each test
afterEach(() => {
  cleanup();
});

// Export the mocks needed by tests
// Primarily export the object containing the auth mocks
export const mocks = {
  mockPush,
  mockReplace,
  mockSupabaseAuth, // Export the main auth mock object
};
