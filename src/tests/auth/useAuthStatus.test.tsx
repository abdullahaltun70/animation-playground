import { act, renderHook } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';

import { useAuth } from '@/app/(auth)/hooks/useAuth';

// Mock Supabase client
const mockSignInWithPassword = vi.fn();
const mockSignUp = vi.fn();
const mockResetPasswordForEmail = vi.fn();
const mockSignInWithOAuth = vi.fn();

vi.mock('@/app/utils/supabase/client', () => ({
  createClient: () => ({
    auth: {
      signInWithPassword: mockSignInWithPassword,
      signUp: mockSignUp,
      resetPasswordForEmail: mockResetPasswordForEmail,
      signInWithOAuth: mockSignInWithOAuth,
    },
  }),
}));

describe('useAuth Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with loading: false, error: null, and alert hidden', () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.showAlert).toBe(false);
  });

  it('should set error for invalid email on sign in', async () => {
    const { result } = renderHook(() => useAuth());
    await act(async () => {
      await result.current.handleSignIn({ email: 'bademail', password: 'pw' });
    });
    expect(result.current.error).toMatch(/valid email/i);
  });

  it('should call signInWithPassword and clear error on valid sign in', async () => {
    mockSignInWithPassword.mockResolvedValueOnce({ error: null });
    const { result } = renderHook(() => useAuth());
    await act(async () => {
      await result.current.handleSignIn({
        email: 'test@example.com',
        password: 'pw123456',
      });
    });
    expect(mockSignInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'pw123456',
    });
    expect(result.current.error).toBeNull();
  });

  it('should set error if signInWithPassword returns error', async () => {
    mockSignInWithPassword.mockResolvedValueOnce({
      error: { message: 'Invalid login credentials' },
    });
    const { result } = renderHook(() => useAuth());
    await act(async () => {
      await result.current.handleSignIn({
        email: 'test@example.com',
        password: 'wrongpw',
      });
    });
    expect(result.current.error).toMatch(/invalid email or password/i);
  });

  it('should call signUp and show alert on success', async () => {
    mockSignUp.mockResolvedValueOnce({ error: null });
    const { result } = renderHook(() => useAuth());
    await act(async () => {
      await result.current.handleSignUp({
        email: 'new@example.com',
        password: 'pw123456',
      });
    });
    expect(mockSignUp).toHaveBeenCalledWith({
      email: 'new@example.com',
      password: 'pw123456',
    });
    expect(result.current.showAlert).toBe(true);
    expect(result.current.alertTitle).toMatch(/verification sent/i);
  });

  it('should call resetPasswordForEmail and show alert on success', async () => {
    mockResetPasswordForEmail.mockResolvedValueOnce({ error: null });
    const { result } = renderHook(() => useAuth());
    await act(async () => {
      await result.current.handlePasswordReset({ email: 'reset@example.com' });
    });
    expect(mockResetPasswordForEmail).toHaveBeenCalled();
    expect(result.current.showAlert).toBe(true);
    expect(result.current.alertTitle).toMatch(/reset instructions sent/i);
  });

  it('should call signInWithOAuth for Google sign in', async () => {
    mockSignInWithOAuth.mockResolvedValueOnce({ error: null });
    const { result } = renderHook(() => useAuth());
    await act(async () => {
      await result.current.handleGoogleSignIn();
    });
    expect(mockSignInWithOAuth).toHaveBeenCalledWith({
      provider: 'google',
      options: expect.any(Object),
    });
  });
});
