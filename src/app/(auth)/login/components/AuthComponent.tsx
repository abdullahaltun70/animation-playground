// src/app/(auth)/login/AuthComponent.tsx (of hernoem page.tsx direct)
'use client';

import React, { useEffect, useState } from 'react';

import { Button, Flex, Link as RadixLink, Text } from '@radix-ui/themes'; // Gebruik Radix Text & Link
import { useForm } from 'react-hook-form';

import {
	SignInFormData,
	SignUpFormData,
	useAuth,
} from '@/app/(auth)/hooks/useAuth';
import GoogleButton from '@/app/(auth)/login/components/GoogleButton';

import AlertNotification from './AlertComponent';
import styles from '../styles/AuthComponent.module.scss';

// --- Type definities (ongewijzigd) ---
enum AuthView {
	SIGN_IN,
	SIGN_UP,
	FORGOT_PASSWORD,
}

// --- Hulpcomponenten (optioneel, voor leesbaarheid) ---
interface AuthLinkProps {
	onClick: (event: React.MouseEvent<HTMLAnchorElement>) => void;
	children: React.ReactNode;
}

const AuthLink: React.FC<AuthLinkProps> = ({ onClick, children }) => (
	<RadixLink href="#" size="2" onClick={onClick} className={styles.link}>
		{children}
	</RadixLink>
);

interface AuthButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	loading?: boolean;
}
const AuthButton: React.FC<AuthButtonProps> = ({
	children,
	loading,
	...props
}) => (
	<Button
		disabled={loading}
		{...props}
		className={styles.button}
		type={'submit'}
		color={'indigo'}
	>
		{loading ? 'Processing...' : children}
	</Button>
);

// --- Hoofdcomponent ---

const AuthComponent: React.FC = () => {
	// Gebruik de custom hook om state en handlers te krijgen
	const {
		loading,
		error,
		showAlert,
		alertTitle,
		alertMessage,
		setError, // Krijg setError van de hook
		setShowAlert,
		handleGoogleSignIn,
		handleSignIn,
		handleSignUp,
		handlePasswordReset,
	} = useAuth();

	const [view, setView] = useState<AuthView>(AuthView.SIGN_IN);

	const signInForm = useForm<SignInFormData>();
	const signUpForm = useForm<SignUpFormData>();
	const forgotPasswordForm = useForm<{ email: string }>();

	// Nu resetten we de error state *van de hook*
	useEffect(() => {
		setError(null);
		signInForm.reset();
		signUpForm.reset();
		forgotPasswordForm.reset();
		// We hoeven geen loading/alert state te resetten, dat doet de hook zelf per actie
	}, [view, setError, signInForm, signUpForm, forgotPasswordForm]); // Voeg setError toe aan dependencies

	// --- ASYNCHRONE WRAPPERS VOOR HANDLERS (om view te kunnen switchen) ---
	// We maken kleine async wrappers zodat we de 'await' kunnen gebruiken
	// en de return value van de hook handlers kunnen checken.

	const onSignUpSubmit = async (data: SignUpFormData) => {
		const success = await handleSignUp(data);
		if (success) {
			// Optioneel: direct naar login na succesvolle registratie-aanvraag
			setView(AuthView.SIGN_IN);
		}
	};

	const onPasswordResetSubmit = async (data: { email: string }) => {
		const success = await handlePasswordReset(data);
		if (success) {
			// Ga terug naar login view *alleen* als de reset mail succesvol is verstuurd
			setView(AuthView.SIGN_IN);
		}
	};

	const renderSignInForm = () => (
		<>
			<GoogleButton onClick={handleGoogleSignIn} loading={loading} />
			<div className={styles.divider}>OR</div> {/* Duidelijkere divider */}
			<form
				onSubmit={signInForm.handleSubmit(handleSignIn)}
				className={styles.form}
			>
				<label className={styles.label}>Email address</label>
				<input
					className={styles.input}
					type="email"
					placeholder="Your email address"
					required
					{...signInForm.register('email', { required: true })}
				/>

				<label className={styles.label}>Your Password</label>
				<input
					className={styles.input}
					type="password"
					placeholder="Your password"
					required
					{...signInForm.register('password', { required: true })}
				/>

				{error && (
					<Text size="2" color="red" className={styles.error}>
						{error}
					</Text>
				)}

				<AuthButton type="submit" loading={loading}>
					Sign in
				</AuthButton>
			</form>
			<Flex direction="column" gap="2" align="center" mt="4">
				<AuthLink onClick={() => setView(AuthView.FORGOT_PASSWORD)}>
					Forgot your password?
				</AuthLink>
				<AuthLink onClick={() => setView(AuthView.SIGN_UP)}>
					Don&#39;t have an account? Sign up
				</AuthLink>
			</Flex>
		</>
	);

	const renderSignUpForm = () => (
		<>
			<GoogleButton onClick={handleGoogleSignIn} loading={loading} />
			<div className={styles.divider}>OR</div>
			<form
				onSubmit={signUpForm.handleSubmit(onSignUpSubmit)}
				className={styles.form}
			>
				<label className={styles.label}>Email address</label>
				<input
					className={styles.input}
					type="email"
					placeholder="Your email address"
					required
					{...signUpForm.register('email', { required: 'Email is required' })}
				/>
				{/* Toon specifieke errors */}
				{signUpForm.formState.errors.email && (
					<Text size="2" color="red" className={styles.error}>
						{signUpForm.formState.errors.email.message}
					</Text>
				)}

				<label className={styles.label}>Create a Password</label>
				<input
					className={styles.input}
					type="password"
					placeholder="Your password"
					required
					{...signUpForm.register('password', {
						required: 'Password is required',
						minLength: {
							value: 6,
							message: 'Password must be at least 6 characters',
						},
					})}
				/>
				{signUpForm.formState.errors.password && (
					<Text size="2" color="red" className={styles.error}>
						{signUpForm.formState.errors.password.message}
					</Text>
				)}

				{/* Algemene error */}

				{error &&
					!signUpForm.formState.errors.email &&
					!signUpForm.formState.errors.password && (
						<Text size="2" color="red" className={styles.error}>
							{error}
						</Text>
					)}

				<AuthButton type="submit" loading={loading}>
					Sign up
				</AuthButton>
			</form>

			<Flex direction="column" gap="2" align="center" mt="4">
				<AuthLink onClick={() => setView(AuthView.SIGN_IN)}>
					Already have an account? Sign in
				</AuthLink>
			</Flex>
		</>
	);

	const renderForgotPasswordForm = () => (
		<>
			<Text size="2" color="gray" align="center" mb="4">
				Enter your email address and we&#39;ll send you instructions to reset
				your password.
			</Text>
			<form
				onSubmit={forgotPasswordForm.handleSubmit(onPasswordResetSubmit)}
				className={styles.form}
			>
				<label className={styles.label}>Email address</label>
				<input
					className={styles.input}
					type="email"
					placeholder="Your email address"
					required
					{...forgotPasswordForm.register('email', {
						required: 'Email is required',
					})}
				/>
				{forgotPasswordForm.formState.errors.email && (
					<Text size="2" color="red" className={styles.error}>
						{forgotPasswordForm.formState.errors.email.message}
					</Text>
				)}

				{/* Algemene error van de hook */}
				{error && !forgotPasswordForm.formState.errors.email && (
					<Text size="2" color="red" className={styles.error}>
						{error}
					</Text>
				)}

				<AuthButton type="submit" loading={loading}>
					Send reset instructions
				</AuthButton>
			</form>

			<Flex direction="column" gap="2" align="center" mt="4">
				<AuthLink onClick={() => setView(AuthView.SIGN_IN)}>
					Back to Sign in
				</AuthLink>
			</Flex>
		</>
	);

	// --- Main Render ---
	return (
		<>
			{view === AuthView.SIGN_IN && renderSignInForm()}
			{view === AuthView.SIGN_UP && renderSignUpForm()}
			{view === AuthView.FORGOT_PASSWORD && renderForgotPasswordForm()}
			{/* AlertNotification gebruikt nu direct state van de hook */}
			<AlertNotification
				showAlert={showAlert}
				setShowAlert={setShowAlert}
				alertTitle={alertTitle}
				alertMessage={alertMessage}
			/>
		</>
	);
};

export default AuthComponent;
