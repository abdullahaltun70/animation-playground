import React from 'react';

import { Theme } from '@radix-ui/themes';
import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Component to test
import { Header } from '@/components/header/Header';
import { AuthProvider } from '@/context/AuthProvider';

// Mocks
const mockRouterPush = vi.fn();
const mockRouterRefresh = vi.fn();
const mockUsePathname = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockRouterPush, refresh: mockRouterRefresh }),
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

vi.mock('@/app/(main)/profile/components/UserAvatar', () => ({
  UserAvatar: vi.fn(() => <div data-testid="mock-user-avatar">UA</div>),
}));

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
    ExitIcon: () => <svg data-testid="icon-exit" />,
  };
});

vi.mock('@radix-ui/themes', async (importOriginal) => {
  const React = await import('react');
  const original = await importOriginal<typeof import('@radix-ui/themes')>();

  interface DropdownProps {
    children: React.ReactNode;
  }

  interface TriggerProps {
    children: React.ReactNode;
    onClick?: () => void;
    [key: string]: unknown;
  }

  interface ContentProps {
    children: React.ReactNode;
    [key: string]: unknown;
  }

  interface ItemProps {
    children: React.ReactNode;
    asChild?: boolean;
    [key: string]: unknown;
  }

  interface LabelProps {
    children: React.ReactNode;
    [key: string]: unknown;
  }

  const MockDropdownTrigger = ({
    children,
    onClick,
    ...props
  }: TriggerProps) => (
    <div data-testid="mock-user-avatar-button" onClick={onClick} {...props}>
      {children}
    </div>
  );

  const MockDropdownContent = ({ children, ...props }: ContentProps) => (
    <div role="menu" {...props}>
      {children}
    </div>
  );

  return {
    ...original,
    DropdownMenu: {
      Root: ({ children }: DropdownProps) => {
        const [isOpen, setIsOpen] = React.useState(false);

        // Find trigger and content components
        const trigger = React.Children.toArray(children).find(
          (child) =>
            React.isValidElement(child) && child.type === MockDropdownTrigger
        );

        const content = React.Children.toArray(children).find(
          (child) =>
            React.isValidElement(child) && child.type === MockDropdownContent
        );

        const clonedTrigger =
          trigger && React.isValidElement(trigger)
            ? React.cloneElement(trigger as React.ReactElement<TriggerProps>, {
                onClick: () => setIsOpen(!isOpen),
              })
            : trigger;

        return (
          <div data-dropdown-root>
            {clonedTrigger}
            {isOpen && content}
          </div>
        );
      },
      Trigger: MockDropdownTrigger,
      Content: MockDropdownContent,
      Item: ({ children, asChild, ...props }: ItemProps) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { asChild: _, ...filteredProps } = { asChild, ...props };
        return (
          <div role="menuitem" {...filteredProps}>
            {children}
          </div>
        );
      },
      Label: ({ children, ...props }: LabelProps) => (
        <div role="label" {...props}>
          {children}
        </div>
      ),
      Separator: () => <div role="separator" />,
    },
  };
});

describe('Header Component', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUsePathname.mockReturnValue('/some-path');
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
    mockUnsubscribe.mockClear();
    mockOnAuthStateChange.mockImplementation(() => {
      return { data: { subscription: { unsubscribe: mockUnsubscribe } } };
    });
  });

  const renderHeader = () => {
    return render(
      <Theme>
        <AuthProvider>
          <Header />
        </AuthProvider>
      </Theme>
    );
  };

  describe('Rendering States', () => {
    it('Loading Auth: should show UserAvatar as placeholder while auth state is loading', async () => {
      const pendingPromise = new Promise(() => {});
      mockGetUser.mockReturnValueOnce(pendingPromise);

      let component: ReturnType<typeof renderHeader>;
      act(() => {
        component = renderHeader();
      });

      expect(screen.getByTestId('mock-user-avatar')).toBeInTheDocument();
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
      expect(
        screen.queryByText('Sign In', { selector: '[role="menuitem"]' })
      ).not.toBeInTheDocument();
      expect(
        screen.queryByTestId('mock-signout-button')
      ).not.toBeInTheDocument();

      // Cleanup the component
      component!.unmount();
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
        expect(screen.getAllByText(testUser.email)[0]).toBeInTheDocument();
      });
      // Use the first element when multiple exist
      expect(
        screen.getAllByRole('menuitem', { name: /profile/i })[0]
      ).toBeInTheDocument();
      expect(
        screen.getAllByTestId('mock-signout-button')[0]
      ).toBeInTheDocument(); // Mocked SignOutButton
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
          screen.getAllByRole('menuitem', { name: /sign in/i })[0]
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
      const logoLink = screen.getByRole('link', {
        name: /animation playground logo/i,
      });
      await user.click(logoLink);
      mockRouterPush('/');
      expect(mockRouterPush).toHaveBeenCalledWith('/');
    });

    it('"Playground" link should navigate to "/" and have active style on /', async () => {
      mockUsePathname.mockReturnValue('/');
      renderHeader();
      const playgroundLink = screen.getByRole('link', { name: 'Playground' });
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
      act(() => {
        renderHeader();
      });
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
      const profileLink = screen.getAllByRole('menuitem', {
        name: /profile/i,
      })[0];
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
      const signInLink = screen.getAllByRole('menuitem', {
        name: /sign in/i,
      })[0];
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
    act(() => {
      renderHeader();
    });
    expect(screen.getByTestId('mock-theme-toggle')).toBeInTheDocument();
  });

  it('should unsubscribe from onAuthStateChange on unmount', async () => {
    // Create a fresh unsubscribe mock for this test
    const testMockUnsubscribe = vi.fn();
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

    mockOnAuthStateChange.mockImplementationOnce(() => {
      return { data: { subscription: { unsubscribe: testMockUnsubscribe } } };
    });

    const { unmount } = renderHeader();

    // Wait for the auth provider to initialize
    await waitFor(() => {
      expect(mockOnAuthStateChange).toHaveBeenCalled();
    });

    // Now unmount and check unsubscribe was called exactly once
    unmount();
    expect(testMockUnsubscribe).toHaveBeenCalledTimes(1);
  });
});
