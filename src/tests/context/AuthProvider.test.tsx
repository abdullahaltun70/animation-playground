import React, { useContext } from 'react';

import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';

import { AuthProvider, AuthContext } from '@/context/AuthProvider';

const mockRouterPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockRouterPush,
  }),
}));

const mockGetUser = vi.fn();
const mockOnAuthStateChange = vi.fn();
const mockSignOut = vi.fn();
const mockUnsubscribe = vi.fn();

vi.mock('@/app/utils/supabase/client', () => ({
  createClient: () => ({
    auth: {
      getUser: mockGetUser,
      onAuthStateChange: mockOnAuthStateChange,
      signOut: mockSignOut,
    },
  }),
}));

const TestConsumerComponent = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error(
      'AuthContext not found. Ensure TestConsumerComponent is wrapped in AuthProvider.'
    );
  }
  const { user, isAuthenticated, isLoading, signOut } = context;

  return (
    <div>
      <div data-testid="is-authenticated">
        {isAuthenticated ? 'true' : 'false'}
      </div>
      <div data-testid="is-loading">{isLoading ? 'true' : 'false'}</div>
      <div data-testid="user-email">{user?.email || 'null'}</div>
      <button onClick={signOut}>Sign Out Test</button>
    </div>
  );
};

describe('AuthProvider Component', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    // Set up default mock implementations
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
    mockSignOut.mockResolvedValue({ error: null });
    mockOnAuthStateChange.mockImplementation(() => {
      return { data: { subscription: { unsubscribe: mockUnsubscribe } } };
    });
    // Reset all mocks to ensure clean state
    mockRouterPush.mockReset();
    mockUnsubscribe.mockReset();
  });

  const renderAuthProvider = (
    children: React.ReactNode = <TestConsumerComponent />
  ) => {
    return render(<AuthProvider>{children}</AuthProvider>);
  };

  describe('Rendering', () => {
    it('should render its children', () => {
      renderAuthProvider(<div>Test Child</div>);
      expect(screen.getByText('Test Child')).toBeInTheDocument();
    });
  });

  describe('Initial Auth State Check', () => {
    it('should initially be loading and then unauthenticated if getUser returns no user', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
      renderAuthProvider();

      expect(screen.getByTestId('is-loading')).toHaveTextContent('true');

      await waitFor(
        () => {
          expect(mockGetUser).toHaveBeenCalled();
        },
        { timeout: 3000 }
      );

      await waitFor(
        () => {
          expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
          expect(screen.getByTestId('is-authenticated')).toHaveTextContent(
            'false'
          );
          expect(screen.getByTestId('user-email')).toHaveTextContent('null');
        },
        { timeout: 3000 }
      );
    });

    it('should set user and authenticated state if getUser returns a user', async () => {
      const testUser = { id: 'user1', email: 'user1@example.com' };
      // Use mockResolvedValue instead of mockResolvedValueOnce to handle multiple calls
      mockGetUser.mockResolvedValue({
        data: { user: testUser },
        error: null,
      });

      renderAuthProvider();

      // Wait for loading to start
      expect(screen.getByTestId('is-loading')).toHaveTextContent('true');

      // Wait for getUser to be called
      await waitFor(() => {
        expect(mockGetUser).toHaveBeenCalled();
      });

      // Wait for loading to complete and auth state to be set
      await waitFor(
        () => {
          expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
        },
        { timeout: 3000 }
      );

      await waitFor(
        () => {
          expect(screen.getByTestId('is-authenticated')).toHaveTextContent(
            'true'
          );
          expect(screen.getByTestId('user-email')).toHaveTextContent(
            'user1@example.com'
          );
        },
        { timeout: 3000 }
      );
    });

    it('should handle error from getUser and remain unauthenticated', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: new Error('GetUser failed'),
      });

      renderAuthProvider();

      await waitFor(
        () =>
          expect(screen.getByTestId('is-loading')).toHaveTextContent('false'),
        { timeout: 3000 }
      );

      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');
      expect(screen.getByTestId('user-email')).toHaveTextContent('null');
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error fetching initial user:',
        expect.any(Error)
      );
      consoleErrorSpy.mockRestore();
    });
  });

  describe('onAuthStateChange Handling', () => {
    let authStateChangeCallback:
      | ((event: string, session: unknown) => void)
      | null = null;

    beforeEach(() => {
      authStateChangeCallback = null;
      mockOnAuthStateChange.mockImplementation((callback) => {
        authStateChangeCallback = callback; // Capture the callback
        return { data: { subscription: { unsubscribe: mockUnsubscribe } } };
      });
    });

    it('should update context on SIGNED_IN event', async () => {
      renderAuthProvider(); // Initial state is unauthenticated after getUser mock
      await waitFor(() =>
        expect(screen.getByTestId('is-loading')).toHaveTextContent('false')
      );
      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');

      const signedInUser = {
        id: 'user-signed-in',
        email: 'signedin@example.com',
      };
      act(() => {
        if (authStateChangeCallback)
          authStateChangeCallback('SIGNED_IN', { user: signedInUser });
      });

      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true');
      expect(screen.getByTestId('user-email')).toHaveTextContent(
        'signedin@example.com'
      );
    });

    it('should update context and navigate on SIGNED_OUT event', async () => {
      // Start as authenticated
      const initialUser = { id: 'user-initial', email: 'initial@example.com' };
      mockGetUser.mockResolvedValue({
        data: { user: initialUser },
        error: null,
      });
      renderAuthProvider();
      await waitFor(
        () =>
          expect(screen.getByTestId('is-authenticated')).toHaveTextContent(
            'true'
          ),
        { timeout: 3000 }
      );

      act(() => {
        if (authStateChangeCallback)
          authStateChangeCallback('SIGNED_OUT', null);
      });

      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');
      expect(screen.getByTestId('user-email')).toHaveTextContent('null');
      expect(mockRouterPush).toHaveBeenCalledWith('/login');
    });

    it('should update context on USER_UPDATED event with a user', async () => {
      renderAuthProvider();
      await waitFor(() =>
        expect(screen.getByTestId('is-loading')).toHaveTextContent('false')
      );

      const updatedUser = { id: 'user-updated', email: 'updated@example.com' };
      act(() => {
        if (authStateChangeCallback)
          authStateChangeCallback('USER_UPDATED', { user: updatedUser });
      });

      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true');
      expect(screen.getByTestId('user-email')).toHaveTextContent(
        'updated@example.com'
      );
    });

    it('should clear context on USER_UPDATED event if session is null', async () => {
      // Start as authenticated
      const initialUser = {
        id: 'user-initial-cleared',
        email: 'cleared@example.com',
      };
      mockGetUser.mockResolvedValue({
        data: { user: initialUser },
        error: null,
      });
      renderAuthProvider();
      await waitFor(
        () =>
          expect(screen.getByTestId('is-authenticated')).toHaveTextContent(
            'true'
          ),
        { timeout: 3000 }
      );

      act(() => {
        if (authStateChangeCallback)
          authStateChangeCallback('USER_UPDATED', null); // No session
      });

      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');
      expect(screen.getByTestId('user-email')).toHaveTextContent('null');
    });
  });

  describe('signOut Function', () => {
    it('should call supabase.auth.signOut, update context, and navigate to /login', async () => {
      // Start as authenticated
      const initialUser = { id: 'user-signout', email: 'signout@example.com' };
      mockGetUser.mockResolvedValue({
        data: { user: initialUser },
        error: null,
      });
      renderAuthProvider();
      await waitFor(
        () =>
          expect(screen.getByTestId('is-authenticated')).toHaveTextContent(
            'true'
          ),
        { timeout: 3000 }
      );

      const signOutButton = screen.getByRole('button', {
        name: 'Sign Out Test',
      });
      await user.click(signOutButton);

      expect(mockSignOut).toHaveBeenCalledTimes(1);
      // Context update and navigation are typically handled by onAuthStateChange SIGNED_OUT event,
      // which signOut should trigger. If signOut itself also clears state, that's fine.
      // The tests for onAuthStateChange SIGNED_OUT already verify context update and navigation.
      // Here, we mainly ensure mockSignOut is called.
      // If the signOut function in the context directly pushes, we can check that too.
      // Based on typical AuthProvider logic, router.push on sign out is often handled by the SIGNED_OUT event.
      // Let's assume the SIGNED_OUT event will fire and handle the rest.
      // If the signOut function in the provider *also* pushes, then this would be called twice.
      // The current AuthProvider's signOut calls supabase.auth.signOut() and then router.push('/login')
      // *before* onAuthStateChange might fire. So, we expect push here.
      expect(mockRouterPush).toHaveBeenCalledWith('/login');
    });

    it('should handle error from supabase.auth.signOut', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      const signOutError = new Error('SignOut failed');
      mockSignOut.mockResolvedValue({ error: signOutError });
      // Start as authenticated
      const initialUser = {
        id: 'user-signout-fail',
        email: 'signoutfail@example.com',
      };
      mockGetUser.mockResolvedValue({
        data: { user: initialUser },
        error: null,
      });
      renderAuthProvider();
      await waitFor(() =>
        expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true')
      );

      const signOutButton = screen.getByRole('button', {
        name: 'Sign Out Test',
      });
      await user.click(signOutButton);

      expect(mockSignOut).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error signing out:',
        signOutError
      );
      // State should ideally remain authenticated if sign out failed, or reflect what onAuthStateChange does.
      // For this test, we focus on the direct error handling of the signOut call.
      // The router.push('/login') in the signOut function might still be called if not guarded by error.
      // Current AuthProvider logic calls router.push regardless of signOut error. This might be a point of review for the actual code.
      // For the test, we verify the console error.
      consoleErrorSpy.mockRestore();
    });
  });

  describe('Subscription Cleanup', () => {
    it('should unsubscribe from onAuthStateChange when the provider unmounts', async () => {
      mockUnsubscribe.mockClear();
      const { unmount } = renderAuthProvider();
      // Ensure initial effects have run
      await waitFor(() => expect(mockGetUser).toHaveBeenCalled());

      unmount();
      expect(mockUnsubscribe).toHaveBeenCalled(); // At least once
    });
  });
});
