// src/app/(auth)/login/AuthComponent.tsx (of hernoem page.tsx direct)
'use client';

import React, { useEffect, useState } from 'react';

import { Button, Flex, Link as RadixLink, Text } from '@radix-ui/themes';
import { useForm } from 'react-hook-form';

import {
	SignInFormData,
	SignUpFormData,
	useAuth,
} from '@/app/(auth)/hooks/useAuth';
import GoogleButton from '@/app/(auth)/login/components/GoogleButton';

import AlertNotification from './AlertComponent';
import styles from '../styles/AuthComponent.module.scss';

enum AuthView {
	SIGN_IN,
	SIGN_UP,
	FORGOT_PASSWORD,
}

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
	// Use custom hook to get state and actions
	const {
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
	} = useAuth();

	const [view, setView] = useState<AuthView>(AuthView.SIGN_IN);

	const signInForm = useForm<SignInFormData>();
	const signUpForm = useForm<SignUpFormData>();
	const forgotPasswordForm = useForm<{ email: string }>();

	// Reset error and form state on view change (and form reset)
	useEffect(() => {
		setError(null);
		signInForm.reset();
		signUpForm.reset();
		forgotPasswordForm.reset();
	}, [view, setError, signInForm, signUpForm, forgotPasswordForm]);

	// --- ASYNCHRONE WRAPPERS FOR HANDLERS (to switch view) ---

	const onSignUpSubmit = async (data: SignUpFormData) => {
		const success = await handleSignUp(data);
		if (success) {
			setView(AuthView.SIGN_IN);
		}
	};

	const onPasswordResetSubmit = async (data: { email: string }) => {
		const success = await handlePasswordReset(data);
		if (success) {
			setView(AuthView.SIGN_IN);
		}
	};

	const renderSignInForm = () => (
		<>
			<GoogleButton onClick={handleGoogleSignIn} loading={loading} />
			<div className={styles.divider}>OR</div>
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
			<AlertNotification
				showAlert={showAlert}
				setShowAlert={setShowAlert}
				alertTitle={alertTitle}
				alertMessage={alertMessage}
				onConfirm={() => setShowAlert(false)}
			/>
		</>
	);
};

export default AuthComponent;
