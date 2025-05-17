// vitest.setup.ts
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { vi, afterEach, beforeEach } from 'vitest';

// --- Mock ResizeObserver globally for JSDOM / Radix UI support ---
// This only needs to be done once.
if (typeof window !== 'undefined' && !window.ResizeObserver) {
  class ResizeObserver {
    observe() {
      /* mock */
    }
    unobserve() {
      /* mock */
    }
    disconnect() {
      /* mock */
    }
  }
  // @ts-ignore
  window.ResizeObserver = ResizeObserver;
  // @ts-ignore
  global.ResizeObserver = ResizeObserver; // Also assign to global for good measure
}

// --- Polyfill/Mock Pointer Event methods and scrollIntoView for JSDOM ---
// This also only needs to be done once.
if (typeof window !== 'undefined') {
  const pointerEventProps = {
    setPointerCapture: {
      value: function (pointerId: number) {
        /* mock */
      },
      writable: true,
      configurable: true,
    },
    releasePointerCapture: {
      value: function (pointerId: number) {
        /* mock */
      },
      writable: true,
      configurable: true,
    },
    hasPointerCapture: {
      value: function (pointerId: number) {
        return false; /* mock */
      },
      writable: true,
      configurable: true,
    },
  };

  // Apply to Element.prototype
  if (!window.Element.prototype.setPointerCapture) {
    // Check if already defined
    Object.defineProperties(window.Element.prototype, pointerEventProps);
  }

  // Apply to HTMLElement.prototype if it exists and doesn't have them
  // @ts-ignore
  if (typeof HTMLElement !== 'undefined') {
    if (!HTMLElement.prototype.setPointerCapture) {
      // @ts-ignore
      Object.defineProperties(HTMLElement.prototype, pointerEventProps);
    }
  }

  // Add scrollIntoView mock if not present
  if (!window.Element.prototype.scrollIntoView) {
    window.Element.prototype.scrollIntoView = function () {
      /* mock */
    };
  }
  // @ts-ignore
  if (
    typeof HTMLElement !== 'undefined' &&
    !HTMLElement.prototype.scrollIntoView
  ) {
    // @ts-ignore
    HTMLElement.prototype.scrollIntoView = function () {
      /* mock */
    };
  }
}

// --- Mock navigator.clipboard ---
// This needs to be defined before it's potentially accessed by tests or hooks during import.
const mockClipboard = {
  writeText: vi.fn(),
  readText: vi.fn(),
};

if (typeof navigator !== 'undefined') {
  Object.defineProperty(navigator, 'clipboard', {
    value: mockClipboard,
    writable: true,
    configurable: true,
  });
} else {
  // @ts-ignore - If navigator doesn't exist (e.g. pure Node env for some tests, though unlikely with JSDOM)
  global.navigator = {
    clipboard: mockClipboard,
  };
}

// --- Mocks for Next.js Navigation ---
const mockPush = vi.fn();
const mockReplace = vi.fn();
const mockRefresh = vi.fn();

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
        if (key === 'id') return null;
        return null;
      }),
    }),
    usePathname: vi.fn().mockReturnValue('/playground'),
    useParams: vi.fn().mockReturnValue({}),
  };
});

// --- Mocks for Supabase Auth Methods (single source of truth) ---
export const mockSupabaseAuth = {
  signUp: vi.fn(),
  signInWithPassword: vi.fn(),
  signInWithOAuth: vi.fn(),
  resetPasswordForEmail: vi.fn(),
  signOut: vi.fn(),
  getSession: vi.fn(),
  getUser: vi.fn(),
  onAuthStateChange: vi.fn(() => ({
    data: { subscription: { unsubscribe: vi.fn() } },
  })),
};

// Mock the primary supabase client factory
vi.mock('@/app/utils/supabase/client', () => ({
  createClient: vi.fn(() => ({
    auth: mockSupabaseAuth,
  })),
}));

// --- Global Test Setup ---
beforeEach(() => {
  vi.clearAllMocks();

  // Reset Supabase Auth mocks
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
  });
  mockSupabaseAuth.getUser.mockResolvedValue({
    data: { user: null },
    error: null,
  });
  (
    mockSupabaseAuth.onAuthStateChange as ReturnType<typeof vi.fn>
  ).mockReturnValue({
    data: { subscription: { unsubscribe: vi.fn() } },
  } as any);

  // Reset clipboard mock behavior
  mockClipboard.writeText.mockResolvedValue(undefined);
  mockClipboard.readText.mockResolvedValue('');
});

afterEach(() => {
  cleanup();
});

// Export for tests to import and use for assertions
export const mocks = {
  mockPush,
  mockReplace,
  mockRefresh,
  mockSupabaseAuth,
  // mockClipboard, // You can export this if tests need to directly manipulate it, though usually not needed
};
