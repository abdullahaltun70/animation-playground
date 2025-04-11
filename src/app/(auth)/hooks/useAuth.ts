import React, { useCallback, useState } from 'react';

import { AuthError } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

import { createClient } from '@/utils/supabase/client';

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
 * Validates an email address format
 * @param email - The email address to validate
 * @returns True if the email format is valid, false otherwise
 */
const isValidEmail = (email: string): boolean => {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Regular expression for validating email addresses, translates to: https://regexr.com/37699
	return emailRegex.test(email);
};

/**
 * Translates authentication error messages to user-friendly messages
 * @param errorMessage - Original error message from auth provider
 * @returns User-friendly error message
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
 * Provides authentication state management and methods for sign-in, sign-up,
 * password reset, and Google OAuth.
 *
 * @returns {UseAuthReturn} Object containing:
 *  - loading: boolean - Current loading state of auth operations
 *  - error: string | null - Current error message if any
 *  - showAlert: boolean - Alert visibility state
 *  - alertTitle: string - Title for alert messages
 *  - alertMessage: string - Content for alert messages
 *  - setError: Function - Error state setter
 *  - setShowAlert: Function - Alert visibility setter
 *  - handleGoogleSignIn: () => Promise<void> - Google OAuth handler
 *  - handleSignIn: (data: SignInFormData) => Promise<void> - Email/password sign in
 *  - handleSignUp: (data: SignUpFormData) => Promise<boolean> - New user registration
 *  - handlePasswordReset: (data: { email: string }) => Promise<boolean> - Password reset
 *
 * @example
 * const {
 *   loading,
 *   error,
 *   handleSignIn
 * } = useAuth();
 *
 * await handleSignIn({ email: 'user@example.com', password: '********' });
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
			action: () => Promise<boolean>,
		): Promise<boolean> => {
			if (!isValidEmail(data.email)) {
				setError('Please enter a valid email address.');
				return false;
			}
			return await action();
		},
		[setError],
	);

	// Helper for API calls
	const handleAuthAction = useCallback(
		async (
			action: () => Promise<{ error: AuthError | null }>,
			successCallback?: () => void,
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
				// Handle unexpected errors without logging to console
				console.error(
					`Handle Auth Action Error: ${err instanceof Error ? err.message : String(err)}`,
				);
				setError('An unexpected error occurred. Please try again later.');
				return false;
			} finally {
				setLoading(false);
			}
		},
		[setLoading, setError],
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
		[setAlert],
	);

	// --- Auth Handlers ---
	const handleGoogleSignIn = useCallback(async () => {
		await handleAuthAction(async () =>
			supabase.auth.signInWithOAuth({
				provider: 'google',
			}),
		);
	}, [handleAuthAction, supabase.auth]);

	const handleSignIn = useCallback(
		async (data: SignInFormData) => {
			await validateAndExecute(data, async () =>
				handleAuthAction(
					() => supabase.auth.signInWithPassword(data),
					() => router.push('/profile'),
				),
			);
		},
		[validateAndExecute, handleAuthAction, supabase.auth, router],
	);

	const handleSignUp = useCallback(
		async (data: SignUpFormData) => {
			return await validateAndExecute(data, async () =>
				handleAuthAction(
					() => supabase.auth.signUp(data),
					() => {
						showAlertMessage(
							'Verification Sent',
							'Verification email has been sent. Please check your inbox.',
						);
					},
				),
			);
		},
		[validateAndExecute, handleAuthAction, supabase.auth, showAlertMessage],
	);

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
							'Password reset instructions have been sent to your email.',
						);
					},
				),
			);
		},
		[validateAndExecute, handleAuthAction, supabase.auth, showAlertMessage],
	);

	// For backward compatibility with existing interface
	// For backward compatibility with existing interface
	const setShowAlert = useCallback(
		(value: React.SetStateAction<boolean>) => {
			setAlert((prev) => ({
				...prev,
				show: typeof value === 'function' ? value(prev.show) : value,
			}));
		},
		[setAlert],
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
