import React, { useCallback, useState } from 'react';

import { AuthError } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

import { createClient } from '@/app/utils/supabase/client';

// Types
export interface SignInFormData {
  email: string;
  password: string;
}

export interface SignUpFormData {
  email: string;
  password: string;
}

export interface PasswordResetData {
  email: string;
}

interface AlertState {
  show: boolean;
  title: string;
  message: string;
}

/**
 * Validates an email address format.
 * @param {string} email - The email address to validate.
 * @returns {boolean} True if the email format is valid, false otherwise.
 */
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Translates authentication error messages to user-friendly messages.
 * @param {string} errorMessage - Original error message from the authentication provider.
 * @returns {string} User-friendly error message.
 */
const getErrorMessage = (errorMessage: string): string => {
  if (errorMessage.includes('Invalid login credentials')) {
    return 'Invalid email or password.';
  } else if (errorMessage.includes('User already registered')) {
    return 'This email address is already registered.';
  } else if (errorMessage.includes('Unable to validate email address')) {
    return 'Please enter a valid email address.';
  }
  return errorMessage || 'An unexpected error occurred.';
};

interface UseAuthReturn {
  loading: boolean;
  error: string | null;
  showAlert: boolean;
  alertTitle: string;
  alertMessage: string;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  setShowAlert: React.Dispatch<React.SetStateAction<boolean>>;
  handleGoogleSignIn: () => Promise<void>;
  handleSignIn: (data: SignInFormData) => Promise<void>;
  handleSignUp: (data: SignUpFormData) => Promise<boolean>;
  handlePasswordReset: (data: PasswordResetData) => Promise<boolean>;
}

/**
 * Custom hook for handling authentication operations with Supabase.
 *
 * This hook encapsulates the logic for user sign-in (including Google OAuth),
 * sign-up, and password reset. It manages loading states, error handling,
 * and displays alerts for feedback to the user.
 *
 * @returns {UseAuthReturn} An object containing:
 *  - `loading`: A boolean indicating if an authentication operation is in progress.
 *  - `error`: A string containing the latest error message, or null if no error.
 *  - `showAlert`: A boolean to control the visibility of an alert message.
 *  - `alertTitle`: The title for the alert message.
 *  - `alertMessage`: The main content of the alert message.
 *  - `setError`: Function to manually set the error state.
 *  - `setShowAlert`: Function to manually control the alert's visibility.
 *  - `handleGoogleSignIn`: An async function to initiate Google Sign-In.
 *  - `handleSignIn`: An async function to sign in a user with email and password.
 *  - `handleSignUp`: An async function to register a new user.
 *  - `handlePasswordReset`: An async function to initiate a password reset process for a given email.
 *
 * @example
 * // To use the hook in a component:
 * const { loading, error, handleSignIn, showAlert, alertTitle, alertMessage } = useAuth();
 *
 * // Example of signing in a user:
 * const onSignIn = async (formData) => {
 *   await handleSignIn(formData);
 *   // Handle post-sign-in logic, e.g., redirecting the user
 * };
 *
 * // Displaying an alert:
 * if (showAlert) {
 *   // Render an alert component with alertTitle and alertMessage
 * }
 */
export const useAuth = (): UseAuthReturn => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [alert, setAlert] = useState<AlertState>({
    show: false,
    title: '',
    message: '',
  });

  const supabase = createClient();
  const router = useRouter();

  // Validate email and execute action if valid
  const validateAndExecute = useCallback(
    async <T extends { email: string }>(
      data: T,
      action: () => Promise<boolean>
    ): Promise<boolean> => {
      if (!isValidEmail(data.email)) {
        setError('Please enter a valid email address.');
        return false;
      }
      return await action();
    },
    [setError]
  );

  // Helper for API calls
  const handleAuthAction = useCallback(
    async (
      action: () => Promise<{ error: AuthError | null }>,
      successCallback?: () => void
    ): Promise<boolean> => {
      setLoading(true);
      setError(null);
      try {
        const { error: actionError } = await action();

        // Error
        if (actionError) {
          const friendlyMessage = getErrorMessage(actionError.message);
          setError(friendlyMessage);
          return false;
        }

        // Success
        if (successCallback) {
          successCallback();
        }
        return true;
      } catch (err: Error | unknown) {
        console.error(
          `Handle Auth Action Error: ${err instanceof Error ? err.message : String(err)}`
        );
        setError('An unexpected error occurred. Please try again later.');
        return false;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError]
  );

  // Display an alert with the specified title and message
  const showAlertMessage = useCallback(
    (title: string, message: string) => {
      setAlert({
        show: true,
        title,
        message,
      });
    },
    [setAlert]
  );

  // --- Auth Handlers ---

  /**
   * Google OAuth handler
   * @returns {Promise<void>} - Promise that resolves when the Google OAuth process is complete
   * @async signIgnInWithOAuth - Google OAuth handler
   */
  const handleGoogleSignIn = useCallback(async () => {
    await handleAuthAction(async () =>
      supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          //first refresh windows and then redirect to home page
          redirectTo: `${window.location.origin}/auth/callback`, // Example callback url (recommended)
        },
      })
    );
    // router.push('/'); // Removed: Let Supabase handle the redirect after OAuth
  }, [handleAuthAction, supabase.auth]); // Removed router from dependencies

  /**
   * Email/password sign in handler
   * @param data - Email and password data
   * @returns {Promise<void>} - Promise that resolves when the sign-in process is complete
   * @async handleSignIn - Email/password sign in handler
   */
  const handleSignIn = useCallback(
    async (data: SignInFormData) => {
      await validateAndExecute(data, async () =>
        handleAuthAction(
          () => supabase.auth.signInWithPassword(data),
          () => router.push('/') // Changed from '/profile' to '/'
        )
      );
    },
    [validateAndExecute, handleAuthAction, supabase.auth, router]
  );

  /**
   * New user registration handler
   * @param data - Email and password
   * @returns {Promise<boolean>} - Promise that resolves when the registration process is complete
   * @async handleSignUp - New user registration handler
   */
  const handleSignUp = useCallback(
    async (data: SignUpFormData) => {
      return await validateAndExecute(data, async () =>
        handleAuthAction(
          () => supabase.auth.signUp(data),
          () => {
            showAlertMessage(
              'Verification Sent',
              'Verification email has been sent. Please check your inbox.'
            );
          }
        )
      );
    },
    [validateAndExecute, handleAuthAction, supabase.auth, showAlertMessage]
  );

  /**
   * Password reset handler
   * @param data - Email for password reset
   * @returns {Promise<boolean>} - Promise that resolves when the password reset process is complete
   * @async handlePasswordReset - Password reset handler
   */
  const handlePasswordReset = useCallback(
    async (data: PasswordResetData) => {
      return await validateAndExecute(data, async () =>
        handleAuthAction(
          () =>
            supabase.auth.resetPasswordForEmail(data.email, {
              // TODO: make the update password page
              redirectTo: `${window.location.origin}/update-password`,
            }),
          () => {
            showAlertMessage(
              'Reset Instructions Sent',
              'Password reset instructions have been sent to your email.'
            );
          }
        )
      );
    },
    [validateAndExecute, handleAuthAction, supabase.auth, showAlertMessage]
  );

  /**
   * Set the alert visibility state
   * @param value - New visibility state
   * @param callback - Optional callback function to modify the visibility state
   * @returns {void} - Updates the alert visibility state
   */
  const setShowAlert = useCallback(
    (value: React.SetStateAction<boolean>) => {
      setAlert((prev) => ({
        ...prev,
        show: typeof value === 'function' ? value(prev.show) : value,
      }));
    },
    [setAlert]
  );

  return {
    loading,
    error,
    showAlert: alert.show,
    alertTitle: alert.title,
    alertMessage: alert.message,
    setError,
    setShowAlert,
    handleGoogleSignIn,
    handleSignIn,
    handleSignUp,
    handlePasswordReset,
  };
};
