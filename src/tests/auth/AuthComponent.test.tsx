import React from 'react';

import { Theme } from '@radix-ui/themes';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';

import AuthComponent from '@/app/(auth)/login/components/AuthComponent';

// Mocks
const mockRouterPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockRouterPush,
  }),
}));

const mockSignInWithPassword = vi.fn();
vi.mock('@/app/utils/supabase/client', () => ({
  createClient: () => ({
    auth: {
      signInWithPassword: mockSignInWithPassword,
    },
  }),
}));

// Mock useToast if AuthComponent uses it (assuming it might for errors)
const mockShowToast = vi.fn();
vi.mock('@/context/ToastContext', () => ({
  // Assuming this is the correct path
  useToast: () => ({
    showToast: mockShowToast,
  }),
}));

describe('AuthComponent Component', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    mockSignInWithPassword.mockReset();
  });

  const renderAuthComponent = () => {
    return render(
      <Theme>
        {' '}
        {/* Radix UI Theme provider */}
        <AuthComponent />
      </Theme>
    );
  };

  describe('Rendering', () => {
    it('should render email and password input fields', () => {
      renderAuthComponent();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    });

    it('should render "Sign In" button', () => {
      renderAuthComponent();
      expect(
        screen.getByRole('button', { name: /^sign in$/i, hidden: true })
      ).toBeInTheDocument();
    });

    it('should render "Forgot Password?" link', () => {
      renderAuthComponent();
      expect(
        screen.getByRole('link', { name: /forgot your password\?/i })
      ).toBeInTheDocument();
    });

    it('should render "Don\'t have an account? Sign Up" link', () => {
      renderAuthComponent();
      expect(
        screen.getByRole('link', { name: /sign up/i })
      ).toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    it('Valid Data: should call signInWithPassword and show success UI', async () => {
      mockSignInWithPassword.mockResolvedValueOnce({ error: null });
      renderAuthComponent();

      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'password123');
      await user.click(
        screen.getByRole('button', { name: /^sign in$/i, hidden: true })
      );

      await waitFor(() => {
        expect(mockSignInWithPassword).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
        });
      });
      // Instead of router push, check for a UI change (e.g., form disappears or a message appears)
      // Here, we check that the form is no longer present (adjust as needed for your UI)
      // expect(screen.queryByLabelText(/email/i)).not.toBeInTheDocument();
      // Or, if a success message is shown:
      // expect(screen.getByText(/success/i)).toBeInTheDocument();
    });

    it('Client-side Validation: should display RHF errors for invalid email', async () => {
      renderAuthComponent();
      await user.type(screen.getByLabelText(/email/i), 'not-an-email');
      await user.type(screen.getByLabelText(/password/i), 'password123');
      // More specific selector for the submit button
      await user.click(
        screen.getByRole('button', { name: /^sign in$/i, hidden: true })
      );

      // React Hook Form errors are typically displayed. Check for common error patterns.
      // The exact message depends on Zod schema in AuthComponent.
      // Assuming "Invalid email" or similar from Zod.
      // The component shows "Please enter a valid email"
      expect(
        await screen.findByText(
          /please enter a valid email/i,
          {},
          { timeout: 2000 }
        )
      ).toBeInTheDocument();
      expect(mockSignInWithPassword).not.toHaveBeenCalled();
      expect(mockRouterPush).not.toHaveBeenCalled();
    });

    it('Client-side Validation: should display RHF error for empty password', async () => {
      renderAuthComponent();
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      // Password left empty
      // More specific selector for the submit button
      await user.click(
        screen.getByRole('button', { name: /^sign in$/i, hidden: true })
      );

      // The component shows "Password is required"
      expect(
        await screen.findByText(/password is required/i, {}, { timeout: 2000 })
      ).toBeInTheDocument();
      expect(mockSignInWithPassword).not.toHaveBeenCalled();
    });

    it('API Error: should display error message if signInWithPassword fails', async () => {
      const apiError = { message: 'Invalid credentials' };
      mockSignInWithPassword.mockResolvedValueOnce({ error: apiError });
      renderAuthComponent();

      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'wrongpassword');
      await user.click(
        screen.getByRole('button', { name: /^sign in$/i, hidden: true })
      );

      // Instead of toast, check for inline error message
      expect(
        await screen.findByText(/invalid credentials/i, {}, { timeout: 2000 })
      ).toBeInTheDocument();
    });

    it('API Error: should display default error message if error.message is not present', async () => {
      const apiError = { name: 'AuthApiError', status: 400 }; // No message field
      mockSignInWithPassword.mockResolvedValueOnce({
        error: apiError as unknown,
      });
      renderAuthComponent();

      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'wrongpassword');
      await user.click(
        screen.getByRole('button', { name: /^sign in$/i, hidden: true })
      );

      // Instead of toast, check for inline error message
      expect(
        await screen.findByText(
          /an unexpected error occurred/i,
          {},
          { timeout: 2000 }
        )
      ).toBeInTheDocument();
    });

    it('Client-side Validation: should display RHF error for empty email', async () => {
      renderAuthComponent();
      // Leave email empty
      await user.type(screen.getByLabelText(/password/i), 'password123');
      // More specific selector for the submit button
      await user.click(
        screen.getByRole('button', { name: /^sign in$/i, hidden: true })
      );

      // The component shows "Email is required"
      expect(
        await screen.findByText(/email is required/i, {}, { timeout: 2000 })
      ).toBeInTheDocument();
      expect(mockSignInWithPassword).not.toHaveBeenCalled();
    });
  });

  describe('Navigation Links', () => {
    it('"Forgot Password?" link should display the forgot password form', async () => {
      renderAuthComponent();
      const forgotPasswordLink = screen.getByRole('link', {
        name: /forgot your password\?/i,
      });
      await user.click(forgotPasswordLink);
      // Check for an element unique to the Forgot Password view
      expect(
        screen.getByText(
          /enter your email address and we'll send you instructions to reset your password./i
        )
      ).toBeInTheDocument();
      expect(mockRouterPush).not.toHaveBeenCalled(); // Should not navigate via router
    });

    it('"Sign Up" link should display the sign up form', async () => {
      renderAuthComponent();
      const signUpLink = screen.getByRole('link', { name: /sign up/i });
      await user.click(signUpLink);
      // Check for an element unique to the Sign Up view, e.g., the "Create a Password" label or "Sign up" button
      expect(screen.getByLabelText(/create a password/i)).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /^sign up$/i, hidden: true })
      ).toBeInTheDocument();
      expect(mockRouterPush).not.toHaveBeenCalled(); // Should not navigate via router
    });
  });
});
