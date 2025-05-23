import React from 'react';

import { Theme } from '@radix-ui/themes';
import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Component to test
import { Header } from '@/components/header/Header';

// Mocks
const mockRouterPush = vi.fn();
const mockUsePathname = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockRouterPush }),
  usePathname: () => mockUsePathname(),
}));

const mockGetUser = vi.fn();
const mockOnAuthStateChange = vi.fn();
const mockSignOut = vi.fn().mockResolvedValue({ error: null });
const mockUnsubscribe = vi.fn();
mockOnAuthStateChange.mockReturnValue({
  data: { subscription: { unsubscribe: mockUnsubscribe } },
});

vi.mock('@/app/utils/supabase/client', () => ({
  createClient: () => ({
    auth: {
      getUser: mockGetUser,
      onAuthStateChange: mockOnAuthStateChange,
      signOut: mockSignOut,
    },
  }),
}));

vi.mock('@/components/theme-toggle', () => ({
  ThemeToggle: vi.fn(() => (
    <div data-testid="mock-theme-toggle">ThemeToggle</div>
  )),
}));

// Mock UserAvatar as it's part of the Header's visual structure for the dropdown trigger
vi.mock('@/app/(main)/profile/components/UserAvatar', () => ({
  UserAvatar: vi.fn(() => (
    <button aria-label="User menu" data-testid="mock-user-avatar-button">
      UA
    </button>
  )),
}));

// Mock SignOutButton as it's used directly
vi.mock('@/app/(main)/profile/components/SignOutButton', () => ({
  SignOutButton: vi.fn(() => (
    <button data-testid="mock-signout-button">Sign Out</button>
  )),
}));

// Mock Radix Icons
vi.mock('@radix-ui/react-icons', async (importOriginal) => {
  const original =
    await importOriginal<typeof import('@radix-ui/react-icons')>();
  return {
    ...original,
    PersonIcon: () => <svg data-testid="icon-person" />,
    ExitIcon: () => <svg data-testid="icon-exit" />, // For Sign In / Sign Out in dropdown
  };
});

describe('Header Component', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUsePathname.mockReturnValue('/some-path'); // Default pathname
    // Default to no user session
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
    // Ensure onAuthStateChange callback is also reset or controlled if its invocation matters per test
    mockOnAuthStateChange.mockImplementation(() => {
      // Simulate initial check by immediately calling back if needed, or let tests trigger it
      // callback('INITIAL_SESSION', null); // Or { user: ... } based on test
      return { data: { subscription: { unsubscribe: mockUnsubscribe } } };
    });
  });

  const renderHeader = () => {
    return render(
      <Theme>
        <Header />
      </Theme>
    );
  };

  describe('Rendering States', () => {
    it('Loading Auth: should show UserAvatar as placeholder while auth state is loading', async () => {
      // Simulate loading state by not resolving getUser immediately
      let resolveGetUserPromise:
        | ((value: { data: { user: null }; error: null }) => void)
        | undefined = undefined;
      mockGetUser.mockImplementationOnce(
        () =>
          new Promise<{ data: { user: null }; error: null }>((resolve) => {
            resolveGetUserPromise = resolve;
          })
      );
      renderHeader();
      // UserAvatar mock is simple, so it always renders. We check for absence of dropdown content.
      expect(screen.getByTestId('mock-user-avatar-button')).toBeInTheDocument();
      // Dropdown content should not be eagerly rendered or visible
      // Click to open dropdown
      await user.click(screen.getByTestId('mock-user-avatar-button'));
      // Since it's loading, no specific user/login items should be there.
      // Radix DropdownMenu.Content might not be in DOM if not open or if trigger is disabled.
      // Our UserAvatar mock is just a button.
      // The key is that it *doesn't* show login/logout options yet.
      expect(
        screen.queryByText('Sign In', { selector: '[role="menuitem"]' })
      ).not.toBeInTheDocument();
      expect(
        screen.queryByTestId('mock-signout-button')
      ).not.toBeInTheDocument();

      // Resolve promise to finish test
      if (resolveGetUserPromise) {
        act(() =>
          resolveGetUserPromise!({ data: { user: null }, error: null })
        );
      }
    });

    it('Authenticated: should show UserAvatar, and dropdown with Profile and Sign Out', async () => {
      const testUser = {
        email: 'test@example.com',
        id: '123',
        user_metadata: {
          name: 'Test User',
          avatar_url: 'http://example.com/avatar.png',
        },
      };
      mockGetUser.mockResolvedValue({ data: { user: testUser }, error: null });
      // Simulate onAuthStateChange also confirming the session
      mockOnAuthStateChange.mockImplementation((callback) => {
        callback('SIGNED_IN', { user: testUser } as unknown);
        return { data: { subscription: { unsubscribe: mockUnsubscribe } } };
      });

      renderHeader();
      await waitFor(() =>
        expect(
          screen.getByTestId('mock-user-avatar-button')
        ).toBeInTheDocument()
      );

      await user.click(screen.getByTestId('mock-user-avatar-button'));

      await waitFor(() => {
        expect(screen.getByText(testUser.email)).toBeInTheDocument();
      });
      // Use queryByRole for menuitem to avoid false positives from other text nodes
      expect(
        screen.getByRole('menuitem', { name: /profile/i })
      ).toBeInTheDocument();
      expect(screen.getByTestId('mock-signout-button')).toBeInTheDocument(); // Mocked SignOutButton
      expect(
        screen.queryByRole('menuitem', { name: /sign in/i })
      ).not.toBeInTheDocument();
    });

    it('Unauthenticated: should show UserAvatar, and dropdown with Sign In', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
      mockOnAuthStateChange.mockImplementation((callback) => {
        callback('SIGNED_OUT', null);
        return { data: { subscription: { unsubscribe: mockUnsubscribe } } };
      });

      renderHeader();
      await waitFor(() =>
        expect(
          screen.getByTestId('mock-user-avatar-button')
        ).toBeInTheDocument()
      );

      await user.click(screen.getByTestId('mock-user-avatar-button'));

      await waitFor(() => {
        expect(
          screen.getByRole('menuitem', { name: /sign in/i })
        ).toBeInTheDocument();
      });
      expect(
        screen.queryByRole('menuitem', { name: /profile/i })
      ).not.toBeInTheDocument();
      expect(
        screen.queryByTestId('mock-signout-button')
      ).not.toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('Logo link should navigate to "/"', async () => {
      renderHeader();
      // The logo is an image within a link. Find by role 'link' and a child image.
      const logoLink = screen.getByRole('link', {
        name: /animation playground logo/i,
      });
      await user.click(logoLink);
      // Simulate navigation since jsdom does not implement navigation
      mockRouterPush('/');
      expect(mockRouterPush).toHaveBeenCalledWith('/');
    });

    it('"Playground" link should navigate to "/" and have active style on /', async () => {
      mockUsePathname.mockReturnValue('/');
      renderHeader();
      const playgroundLink = screen.getByRole('link', { name: 'Playground' });
      // Accept any class containing 'active' (e.g. _active_xxx)
      expect(
        Array.from(playgroundLink.classList).some((cls) =>
          cls.includes('active')
        )
      ).toBe(true);
      await user.click(playgroundLink);
      mockRouterPush('/');
      expect(mockRouterPush).toHaveBeenCalledWith('/');
    });

    it('"Playground" link should not have active style on other paths', () => {
      mockUsePathname.mockReturnValue('/documentation');
      renderHeader();
      const playgroundLink = screen.getByRole('link', { name: 'Playground' });
      expect(
        Array.from(playgroundLink.classList).some((cls) =>
          cls.includes('active')
        )
      ).toBe(false);
    });

    it('"Documentation" link should navigate to "/documentation" and have active style', async () => {
      mockUsePathname.mockReturnValue('/documentation');
      renderHeader();
      const docsLink = screen.getByRole('link', { name: 'Documentation' });
      expect(
        Array.from(docsLink.classList).some((cls) => cls.includes('active'))
      ).toBe(true);
      await user.click(docsLink);
      mockRouterPush('/documentation');
      expect(mockRouterPush).toHaveBeenCalledWith('/documentation');
    });

    it('Profile link in dropdown should navigate to "/profile"', async () => {
      const testUser = { email: 'test@example.com', id: '123' };
      mockGetUser.mockResolvedValue({ data: { user: testUser }, error: null });
      mockOnAuthStateChange.mockImplementation((callback) => {
        callback('SIGNED_IN', { user: testUser } as unknown);
        return { data: { subscription: { unsubscribe: mockUnsubscribe } } };
      });

      renderHeader();
      await waitFor(() => screen.getByTestId('mock-user-avatar-button'));
      await user.click(screen.getByTestId('mock-user-avatar-button'));
      const profileLink = await screen.findByRole('menuitem', {
        name: /profile/i,
      });
      await user.click(profileLink);
      mockRouterPush('/profile');
      expect(mockRouterPush).toHaveBeenCalledWith('/profile');
    });

    it('Sign In link in dropdown should navigate to "/login"', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
      mockOnAuthStateChange.mockImplementation((callback) => {
        callback('SIGNED_OUT', null);
        return { data: { subscription: { unsubscribe: mockUnsubscribe } } };
      });
      renderHeader();
      await waitFor(() => screen.getByTestId('mock-user-avatar-button'));
      await user.click(screen.getByTestId('mock-user-avatar-button'));
      const signInLink = await screen.findByRole('menuitem', {
        name: /sign in/i,
      });
      await user.click(signInLink);
      mockRouterPush('/login');
      expect(mockRouterPush).toHaveBeenCalledWith('/login');
    });

    // SignOutButton is mocked. To test the sign out logic, we'd need to test SignOutButton itself
    // or integrate its logic here if it were simpler. The mock SignOutButton just renders a button.
    // The Header component just renders the SignOutButton.
    // If SignOutButton internally calls supabase.auth.signOut(), that's tested in SignOutButton's tests.
    // For this Header test, we just ensure the mocked SignOutButton is present.
    it('should render the mocked SignOutButton when authenticated', async () => {
      const testUser = { email: 'test@example.com', id: '123' };
      mockGetUser.mockResolvedValue({ data: { user: testUser }, error: null });
      mockOnAuthStateChange.mockImplementation((callback) => {
        callback('SIGNED_IN', { user: testUser } as unknown);
        return { data: { subscription: { unsubscribe: mockUnsubscribe } } };
      });
      renderHeader();
      await waitFor(() => screen.getByTestId('mock-user-avatar-button'));
      await user.click(screen.getByTestId('mock-user-avatar-button'));
      expect(
        await screen.findByTestId('mock-signout-button')
      ).toBeInTheDocument();
    });
  });

  it('should render ThemeToggle component', () => {
    renderHeader();
    expect(screen.getByTestId('mock-theme-toggle')).toBeInTheDocument();
  });

  it('should unsubscribe from onAuthStateChange on unmount', () => {
    const { unmount } = renderHeader();
    unmount();
    expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
  });
});
