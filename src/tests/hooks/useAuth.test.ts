import { renderHook, act, waitFor } from '@testing-library/react';
/// <reference types="vitest/globals" />
import { describe, expect, it } from 'vitest';

import { useAuth } from '@/app/(auth)/hooks/useAuth';

import { mocks } from '../../../vitest.setup';

const { mockPush, mockSupabaseAuth, mockReplace } = mocks; // Get the auth object

describe('useAuth', () => {
  // beforeEach and afterEach are now handled globally by vitest.setup.ts

  // Test successful authentication
  it('should successfully call signInWithPassword and update state', async () => {
    const { result } = renderHook(() => useAuth());

    // Act
    await act(async () => {
      // handleSignIn returns void, no need to capture result
      await result.current.handleSignIn({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    // Assert
    // Check the mock function *within* mockSupabaseAuth
    expect(mockSupabaseAuth.signInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
    // Ensure router.replace is not called by the hook for this scenario
    expect(mockReplace).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  // handleGoogleSignIn initiates Google OAuth flow correctly
  it('should initiate Google OAuth flow when handleGoogleSignIn is called', async () => {
    const { result } = renderHook(() => useAuth());

    // Act
    await act(async () => {
      await result.current.handleGoogleSignIn();
    });

    // Assert
    expect(mockSupabaseAuth.signInWithOAuth).toHaveBeenCalledWith({
      provider: 'google',
      options: {
        redirectTo: 'http://localhost:3000/auth/callback', // Adjust this URL as needed
      },
    });
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  // Test invalid credentials
  it('should set error message when credentials are invalid', async () => {
    // Arrange: Override the default mock for THIS test to return an error
    const mockApiError = { message: 'Invalid login credentials' }; // Simulate Supabase error object structure
    mockSupabaseAuth.signInWithPassword.mockResolvedValueOnce({
      data: { user: null, session: null },
      error: mockApiError as unknown as { message: string }, // Cast to a specific error type
    });
    // Inject a logger into useAuth and mock it in tests
    const { result } = renderHook(() => useAuth()); // Call useAuth without logger

    // Act
    await act(async () => {
      await result.current.handleSignIn({
        email: 'wrong@example.com',
        password: 'wrongpassword',
      });
    });

    // Assert
    expect(mockSupabaseAuth.signInWithPassword).toHaveBeenCalledWith({
      email: 'wrong@example.com',
      password: 'wrongpassword',
    });
    expect(mockPush).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      // Check the user-friendly error message set by the hook's getErrorMessage
      expect(result.current.error).toBe('Invalid email or password.');
    });
  });

  // handleSignUp successfully registers a new user
  it('should register a new user and show verification alert when signUp is successful', async () => {
    const { result } = renderHook(() => useAuth());

    let success: boolean | undefined;
    // Act
    await act(async () => {
      success = await result.current.handleSignUp({
        email: 'newuser@example.com',
        password: 'password123',
      });
    });

    // Assert
    expect(mockSupabaseAuth.signUp).toHaveBeenCalledWith({
      email: 'newuser@example.com',
      password: 'password123',
    });
    expect(success).toBe(true);
    await waitFor(() => {
      expect(result.current.showAlert).toBe(true);
      expect(result.current.alertTitle).toBe('Verification Sent');
      expect(result.current.alertMessage).toBe(
        'Verification email has been sent. Please check your inbox.'
      );
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  // handleSignIn with email and password
  it('should successfully call signInWithPassword and update state on sign in', async () => {
    const { result } = renderHook(() => useAuth());

    // Act
    await act(async () => {
      await result.current.handleSignIn({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    // Assert
    expect(mockSupabaseAuth.signInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
    // Ensure router.replace is not called by the hook for this scenario
    expect(mockReplace).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(result.current.error).toBeNull();
      expect(result.current.loading).toBe(false);
    });
  });

  // handlePasswordReset successfully sends reset instructions
  it('should send password reset instructions and show alert when reset is successful', async () => {
    // Arrange: Default mock in setup handles success

    const { result } = renderHook(() => useAuth());

    let success: boolean | undefined;
    // Act
    await act(async () => {
      success = await result.current.handlePasswordReset({
        email: 'user@example.com',
      });
    });

    // Assert
    expect(mockSupabaseAuth.resetPasswordForEmail).toHaveBeenCalledWith(
      'user@example.com',
      // Add options if your hook includes them, e.g.:
      { redirectTo: expect.any(String) }
    );
    expect(success).toBe(true);
    await waitFor(() => {
      expect(result.current.showAlert).toBe(true);
      expect(result.current.alertTitle).toBe('Reset Instructions Sent');
      expect(result.current.alertMessage).toBe(
        'Password reset instructions have been sent to your email.'
      );
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });
});
