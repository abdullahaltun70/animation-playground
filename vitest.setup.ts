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
  window.ResizeObserver = ResizeObserver;
  global.ResizeObserver = ResizeObserver;
}

// --- Polyfill/Mock Pointer Event methods and scrollIntoView for JSDOM ---
// This also only needs to be done once.
if (typeof window !== 'undefined') {
  const pointerEventProps = {
    setPointerCapture: {
      value: function () {
        /* mock - pointerId is unused */
      },
      writable: true,
      configurable: true,
    },
    releasePointerCapture: {
      value: function () {
        /* mock - pointerId is unused */
      },
      writable: true,
      configurable: true,
    },
    hasPointerCapture: {
      value: function () {
        /* mock - pointerId is unused */
        return false; /* mock */
      },
      writable: true,
      configurable: true,
    },
  };

  // Apply to Element.prototype
  if (
    typeof Element !== 'undefined' &&
    Element.prototype &&
    !Element.prototype.setPointerCapture
  ) {
    Object.defineProperties(Element.prototype, pointerEventProps);
  }

  // Apply to HTMLElement.prototype if it exists and doesn't have them
  if (typeof HTMLElement !== 'undefined' && HTMLElement.prototype) {
    if (!HTMLElement.prototype.setPointerCapture) {
      Object.defineProperties(HTMLElement.prototype, pointerEventProps);
    }
  }

  // Add scrollIntoView mock if not present
  if (
    typeof Element !== 'undefined' &&
    Element.prototype &&
    !Element.prototype.scrollIntoView
  ) {
    Element.prototype.scrollIntoView = function () {
      /* mock */
    };
  }
  if (
    typeof HTMLElement !== 'undefined' &&
    HTMLElement.prototype &&
    !HTMLElement.prototype.scrollIntoView
  ) {
    HTMLElement.prototype.scrollIntoView = function () {
      /* mock */
    };
  }
}

// --- Mock navigator.clipboard ---
const mockClipboard = {
  writeText: vi.fn(),
  readText: vi.fn(),
  read: vi.fn(() => Promise.resolve([])), // Return Promise<ClipboardItems> which is ClipboardItem[]
  write: vi.fn(() => Promise.resolve()),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(() => true),
};

if (typeof navigator !== 'undefined') {
  if (!navigator.clipboard) {
    Object.defineProperty(navigator, 'clipboard', {
      value: mockClipboard,
      writable: true,
      configurable: true,
    });
  }
} else {
  // @ts-expect-error Property 'navigator' does not exist on type 'Global & typeof globalThis'.
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
    data: {
      user: { id: 'mock-user-id-signin' },
      session: {
        access_token: 'mock-token',
        user: { id: 'mock-user-id' },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
    }, // Keeping 'as any' for now as Session type is complex
    error: null,
  });
  mockSupabaseAuth.signInWithOAuth.mockResolvedValue({
    data: { provider: 'google', url: 'mock-oauth-url' } as {
      provider: string;
      url: string;
    },
    error: null,
  });
  mockSupabaseAuth.resetPasswordForEmail.mockResolvedValue({
    data: {} as {},
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
  } as { data: { subscription: { unsubscribe: () => void } } });

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
};
