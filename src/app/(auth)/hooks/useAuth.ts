// src/app/(auth)/hooks/useAuth.ts
import { useCallback, useState } from 'react';

import { AuthError } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation'; // Router moet hier geïnitialiseerd worden

import { createClient } from '@/utils/supabase/client'; // Gebruik de client-side Supabase instance

// Exporteer de form data types zodat de component ze kan gebruiken
export interface SignInFormData {
	email: string;
	password: string;
}
export interface SignUpFormData {
	email: string;
	password: string;
}

// Definieer de return type van de hook voor duidelijkheid
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
	handleSignUp: (data: SignUpFormData) => Promise<boolean>; // Geeft aan of succesvol (voor view switch)
	handlePasswordReset: (data: { email: string }) => Promise<boolean>; // Geeft aan of succesvol
}

export const useAuth = (): UseAuthReturn => {
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState<boolean>(false);
	const [showAlert, setShowAlert] = useState<boolean>(false);
	const [alertTitle, setAlertTitle] = useState<string>('');
	const [alertMessage, setAlertMessage] = useState<string>('');

	const supabase = createClient();
	const router = useRouter(); // Haal router op binnen de hook

	// --- Helper voor API calls ---
	// Deze helper blijft intern in de hook
	const handleAuthAction = useCallback(
		async (
			action: () => Promise<{ error: AuthError | null }>, // Gebruik specifiek AuthError type
			successCallback?: () => void,
		): Promise<boolean> => {
			// Geeft true terug bij succes, false bij error
			setLoading(true);
			setError(null);
			try {
				const { error: actionError } = await action();
				if (actionError) {
					// Vertaal Supabase errors eventueel naar gebruiksvriendelijkere meldingen
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
					return false; // Geef aan dat het mislukt is
				}
				// Succes
				if (successCallback) {
					successCallback();
				}
				return true; // Geef aan dat het gelukt is
			} catch (err: any) {
				console.error('Generic Auth Error:', err);
				setError(err.message || 'An unexpected error occurred.');
				return false; // Geef aan dat het mislukt is
			} finally {
				setLoading(false);
			}
		},
		[setLoading, setError], // Voeg state setters toe aan dependencies
	);

	// --- Auth Handlers ---
	const handleGoogleSignIn = useCallback(async () => {
		await handleAuthAction(async () =>
			// De OAuth flow handelt de redirect af, geen success callback nodig hier.
			supabase.auth.signInWithOAuth({
				provider: 'google',
				options: {
					// Optioneel: specificeer waar de gebruiker heen moet na succesvolle Google login
					// redirectTo: `${window.location.origin}/profile`
					// Als je dit gebruikt, zorg dat de URL is toegestaan in je Supabase Auth settings!
				},
			}),
		);
	}, [handleAuthAction, supabase.auth]);

	const handleSignIn = useCallback(
		async (data: SignInFormData) => {
			await handleAuthAction(
				() => supabase.auth.signInWithPassword(data),
				() => router.push('/profile'), // Redirect alleen bij succes
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
					// Geen view switch hier, laat de component dat beslissen op basis van return value
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
						// Optioneel: Specificeer de pagina waar de gebruiker het ww kan updaten
						// redirectTo: `${window.location.origin}/update-password`,
					}),
				() => {
					setAlertTitle('Reset Instructions Sent');
					setAlertMessage(
						'Password reset instructions have been sent to your email.',
					);
					setShowAlert(true);
				},
			); // Geef succes/falen door aan component
		},
		[
			handleAuthAction,
			supabase.auth,
			setAlertTitle,
			setAlertMessage,
			setShowAlert,
		],
	);

	// Return de state en de handlers die de component nodig heeft
	return {
		loading,
		error,
		showAlert,
		alertTitle,
		alertMessage,
		setError, // Exporteer setError voor externe resets indien nodig
		setShowAlert,
		handleGoogleSignIn,
		handleSignIn,
		handleSignUp,
		handlePasswordReset,
	};
};
