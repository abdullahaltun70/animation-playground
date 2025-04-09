import React, { useCallback, useState } from 'react';

import { AuthError } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

import { createClient } from '@/utils/supabase/client';

export interface SignInFormData {
	email: string;
	password: string;
}

export interface SignUpFormData {
	email: string;
	password: string;
}

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
	handlePasswordReset: (data: { email: string }) => Promise<boolean>;
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
	const [showAlert, setShowAlert] = useState<boolean>(false);
	const [alertTitle, setAlertTitle] = useState<string>('');
	const [alertMessage, setAlertMessage] = useState<string>('');

	const supabase = createClient();
	const router = useRouter();

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
					console.error('Supabase Auth Error:', actionError);
					let friendlyMessage =
						actionError.message || 'An unexpected error occurred.';
					if (actionError.message.includes('Invalid login credentials')) {
						friendlyMessage = 'Invalid email or password.';
					} else if (actionError.message.includes('User already registered')) {
						friendlyMessage = 'This email address is already registered.';
					} else if (
						actionError.message.includes('Unable to validate email address')
					) {
						friendlyMessage = 'Please enter a valid email address.';
					}
					setError(friendlyMessage);
					return false;
				}
				// Succes
				if (successCallback) {
					successCallback();
				}
				return true;
			} catch (err: any) {
				console.error('Generic Auth Error:', err);
				setError(err.message || 'An unexpected error occurred.');
				return false;
			} finally {
				setLoading(false);
			}
		},
		[setLoading, setError],
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
			await handleAuthAction(
				() => supabase.auth.signInWithPassword(data),
				() => router.push('/profile'),
			);
		},
		[handleAuthAction, supabase.auth, router],
	);

	const handleSignUp = useCallback(
		async (data: SignUpFormData) => {
			return await handleAuthAction(
				() => supabase.auth.signUp(data),
				() => {
					setAlertTitle('Verification Sent');
					setAlertMessage(
						'Verification email has been sent. Please check your inbox.',
					);
					setShowAlert(true);
				},
			);
		},
		[
			handleAuthAction,
			supabase.auth,
			setAlertTitle,
			setAlertMessage,
			setShowAlert,
		],
	);

	const handlePasswordReset = useCallback(
		async (data: { email: string }) => {
			return await handleAuthAction(
				() =>
					supabase.auth.resetPasswordForEmail(data.email, {
						// TODO: make the update password page
						// redirectTo: `${window.location.origin}/update-password`,
					}),
				() => {
					setAlertTitle('Reset Instructions Sent');
					setAlertMessage(
						'Password reset instructions have been sent to your email.',
					);
					setShowAlert(true);
				},
			);
		},
		[
			handleAuthAction,
			supabase.auth,
			setAlertTitle,
			setAlertMessage,
			setShowAlert,
		],
	);

	return {
		loading,
		error,
		showAlert,
		alertTitle,
		alertMessage,
		setError,
		setShowAlert,
		handleGoogleSignIn,
		handleSignIn,
		handleSignUp,
		handlePasswordReset,
	};
};
