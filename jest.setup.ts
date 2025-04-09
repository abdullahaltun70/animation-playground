// Import the necessary testing utilities
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';

// Set up mocks for next/navigation
const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockBack = jest.fn();
const mockForward = jest.fn();
const mockRefresh = jest.fn();
const mockPrefetch = jest.fn();

// Set up mocks for Supabase client
const mockSignInWithPassword = jest.fn();
const mockSignUp = jest.fn();
const mockSignOut = jest.fn();
const mockGetSession = jest.fn();

// Mock implementations
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    back: mockBack,
    forward: mockForward,
    refresh: mockRefresh,
    prefetch: mockPrefetch
  }),
  useSearchParams: () => ({
    get: jest.fn(),
    getAll: jest.fn(),
    has: jest.fn(),
    forEach: jest.fn(),
    entries: jest.fn(),
    keys: jest.fn(),
    values: jest.fn(),
    toString: jest.fn()
  }),
  usePathname: jest.fn().mockReturnValue('/'),
  useParams: jest.fn().mockReturnValue({}),
}));

jest.mock('@/utils/supabase/client', () => ({
  createClient: jest.fn().mockReturnValue({
    auth: {
      signInWithPassword: mockSignInWithPassword,
      signUp: mockSignUp,
      signOut: mockSignOut,
      getSession: mockGetSession,
      signInWithOAuth: jest.fn().mockResolvedValue({ error: null }),
      resetPasswordForEmail: jest.fn().mockResolvedValue({ error: null })
    },
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockReturnThis(),
      then: jest.fn().mockImplementation(callback => Promise.resolve(callback({ data: [], error: null }))),
    }),
  }),
}));

// Set up and reset mocks before each test
beforeEach(() => {
  // Clear all mocks
  jest.clearAllMocks();
  
  // Set default mock implementations for next/navigation
  mockPush.mockReset();
  mockReplace.mockReset();
  mockBack.mockReset();
  mockForward.mockReset();
  mockRefresh.mockReset();
  mockPrefetch.mockReset();
  
  // Set default mock implementations for Supabase
  mockSignInWithPassword.mockReset().mockImplementation(({ email, password }) => {
    if (email === 'test@example.com' && password === 'password123') {
      return Promise.resolve({ error: null });
    }
    return Promise.resolve({ error: { message: 'Invalid login credentials' } });
  });
  mockSignUp.mockReset().mockResolvedValue({ error: null });
  mockSignOut.mockReset().mockResolvedValue({ error: null });
  mockGetSession.mockReset().mockResolvedValue({ data: { session: null }, error: null });
});

// Clean up after each test
afterEach(() => {
  cleanup();
});

// Export mocks for reuse in tests
export const mocks = {
  mockPush,
  mockReplace,
  mockBack,
  mockForward,
  mockRefresh,
  mockPrefetch,
  mockSignInWithPassword,
  mockSignUp,
  mockSignOut,
  mockGetSession
};

