// Import the necessary testing utilities
import { cleanup } from '@testing-library/react';
import { vi } from 'vitest';
import { afterEach, beforeEach } from 'vitest';

// --- Mocks for Next.js Navigation ---
const mockPush = vi.fn();
const mockReplace = vi.fn();
// Add others if needed in tests (back, forward, etc.)

// --- Mocks for Supabase Auth Methods ---
// These are the core mock functions we will manipulate
const mockSupabaseAuth = {
	signUp: vi.fn(),
	signInWithPassword: vi.fn(),
	signInWithOAuth: vi.fn(),
	resetPasswordForEmail: vi.fn(),
	signOut: vi.fn(), // Added signOut if needed
	getSession: vi.fn(), // Added getSession if needed
};

// --- Mock Implementations ---

// Mock next/navigation
vi.mock('next/navigation', () => ({
	useRouter: () => ({
		push: mockPush,
		replace: mockReplace,
		// Add others if needed
		// back: vi.fn(),
		// forward: vi.fn(),
		// refresh: vi.fn(),
		// prefetch: vi.fn(),
	}),
	useSearchParams: () => ({
		get: vi.fn(),
		// Add others if needed
	}),
	usePathname: vi.fn().mockReturnValue('/'),
	useParams: vi.fn().mockReturnValue({}),
}));

// Mock Supabase client creator
// IMPORTANT: This mock ensures that `createClient()` returns our `mockSupabaseAuth` object.
vi.mock('@/utils/supabase/client', () => ({
	createClient: () => ({
		auth: mockSupabaseAuth,
		// Mock 'from' if your hook uses it directly (unlikely for pure auth)
		// from: vi.fn().mockReturnValue({ ... mock chain ... })
	}),
}));

// --- Global Test Setup ---

// Set up default mock behaviors and reset mocks before each test
beforeEach(() => {
	// Clear call history and reset implementations for ALL mocks
	vi.clearAllMocks();

	// Reset Navigation mocks (optional, clearAllMocks often suffices)
	// mockPush.mockClear();
	// mockReplace.mockClear();

	// Set default SUCCESSFUL return values for Supabase Auth mocks
	// Tests needing specific error cases will override these using .mockResolvedValueOnce / .mockRejectedValueOnce
	mockSupabaseAuth.signUp.mockResolvedValue({
		data: { user: { id: 'mock-user-id-signup' }, session: null }, // Adjust based on actual Supabase response
		error: null,
	});
	mockSupabaseAuth.signInWithPassword.mockResolvedValue({
		data: { user: { id: 'mock-user-id-signin' }, session: {} }, // Adjust based on actual Supabase response
		error: null,
	});
	mockSupabaseAuth.signInWithOAuth.mockResolvedValue({
		data: { url: 'mock-oauth-url' }, // Adjust based on actual Supabase response
		error: null,
	});
	mockSupabaseAuth.resetPasswordForEmail.mockResolvedValue({
		data: {}, // Adjust based on actual Supabase response
		error: null,
	});
	mockSupabaseAuth.signOut.mockResolvedValue({
		error: null,
	});
	mockSupabaseAuth.getSession.mockResolvedValue({
		data: { session: null }, // Default to no session
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
