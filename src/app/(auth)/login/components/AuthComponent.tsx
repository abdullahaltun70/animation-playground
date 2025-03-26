'use client';
// import React, { useState, useEffect } from 'react';
//
// type AuthView = 'signIn' | 'signUp' | 'forgotPassword';
// import { createClient } from '@/utils/supabase/client';
//
// import classNames from './page.module.scss';
//
// const AuthComponent: React.FC = () => {
// 	const [view, setView] = useState<AuthView>('signIn');
// 	const [email, setEmail] = useState('');
// 	const [password, setPassword] = useState('');
// 	const [loading, setLoading] = useState(false);
// 	const [error, setError] = useState<string | null>(null);
// 	const supabase = createClient();
// 	// Reset error when view changes
// 	useEffect(() => {
// 		setError(null);
// 	}, [view]);
//
// 	// Sign in with email and password
// 	const handleEmailSignIn = async (e: React.FormEvent) => {
// 		e.preventDefault();
// 		setLoading(true);
// 		setError(null);
//
// 		try {
// 			// Implement Supabase sign-in logic here
// 			const { error } = await supabase.auth.signInWithPassword({
// 				email,
// 				password,
// 			});
//
// 			if (error) throw error;
// 			// Handle successful sign-in (redirect, etc.)
// 		} catch (err: any) {
// 			setError(err.message || 'Error signing in');
// 		} finally {
// 			setLoading(false);
// 		}
// 	};
//
// 	// Sign up with email and password
// 	const handleEmailSignUp = async (e: React.FormEvent) => {
// 		e.preventDefault();
// 		setLoading(true);
// 		setError(null);
//
// 		try {
// 			// Implement Supabase sign-up logic here
// 			const { error } = await supabase.auth.signUp({
// 				email,
// 				password,
// 			});
//
// 			if (error) throw error;
// 			// Handle successful sign-up (redirect, email confirmation message, etc.)
// 		} catch (err: any) {
// 			setError(err.message || 'Error signing up');
// 		} finally {
// 			setLoading(false);
// 		}
// 	};
//
// 	// Sign in with Google
// 	const handleGoogleSignIn = async () => {
// 		setLoading(true);
// 		setError(null);
//
// 		try {
// 			// Implement Supabase Google sign-in logic here
// 			const { error } = await supabase.auth.signInWithOAuth({
// 				provider: 'google',
// 				options: {
// 					redirectTo: `${window.location.origin}/profile`, // Add your redirect URL
// 				},
// 			});
//
// 			if (error) throw error;
// 		} catch (err: any) {
// 			setError(err.message || 'Error signing in with Google');
// 			setLoading(false);
// 		}
// 	};
//
// 	// Reset password
// 	const handleResetPassword = async (e: React.FormEvent) => {
// 		e.preventDefault();
// 		setLoading(true);
// 		setError(null);
//
// 		try {
// 			// Implement Supabase password reset logic here
// 			const { error } = await supabase.auth.resetPasswordForEmail(email, {
// 				redirectTo: `${window.location.origin}/reset-password`,
// 			});
//
// 			if (error) throw error;
// 			// Handle successful reset request (show message, etc.)
// 		} catch (err: any) {
// 			setError(err.message || 'Error sending password reset instructions');
// 		} finally {
// 			setLoading(false);
// 		}
// 	};
//
// 	return (
// 		<div className={classNames.authContainer}>
// 			<div className={classNames.authHeader}>
// 				<h1>Animation Playground ✨</h1>
// 			</div>
//
// 			<div className={classNames.authContent}>
// 				{/* Sign In View */}
// 				{view === 'signIn' && (
// 					<form onSubmit={handleEmailSignIn}>
// 						<button
// 							type="button"
// 							className={classNames.googleButton}
// 							onClick={handleGoogleSignIn}
// 							disabled={loading}
// 						>
// 							<img
// 								src="https://fonts.gstatic.com/s/i/productlogos/googleg/v6/24px.svg"
// 								alt="Google"
// 								className={classNames.googleIcon}
// 							/>
// 							Sign in with Google
// 						</button>
//
// 						<div className={classNames.divider}>
// 							<hr />
// 						</div>
//
// 						<div className={classNames.formGroup}>
// 							<label htmlFor="email">Email address</label>
// 							<input
// 								id="email"
// 								type="email"
// 								placeholder="Your email address"
// 								value={email}
// 								onChange={(e) => setEmail(e.target.value)}
// 								required
// 							/>
// 						</div>
//
// 						<div className={classNames.formGroup}>
// 							<label htmlFor="password">Your Password</label>
// 							<input
// 								id="password"
// 								type="password"
// 								placeholder="Your password"
// 								value={password}
// 								onChange={(e) => setPassword(e.target.value)}
// 								required
// 							/>
// 						</div>
//
// 						{error && <div className={classNames.errorMessage}>{error}</div>}
//
// 						<button
// 							type="submit"
// 							className={classNames.submitButton}
// 							disabled={loading}
// 						>
// 							{loading ? 'Signing in...' : 'Sign in'}
// 						</button>
//
// 						<div className={classNames.authLinks}>
// 							<a
// 								href="#forgot-password"
// 								onClick={(e) => {
// 									e.preventDefault();
// 									setView('forgotPassword');
// 								}}
// 							>
// 								Forgot your password?
// 							</a>
//
// 							<a
// 								href="#sign-up"
// 								onClick={(e) => {
// 									e.preventDefault();
// 									setView('signUp');
// 								}}
// 							>
// 								Don't have an account? Sign up
// 							</a>
// 						</div>
// 					</form>
// 				)}
//
// 				{/* Sign Up View */}
// 				{view === 'signUp' && (
// 					<form onSubmit={handleEmailSignUp}>
// 						<button
// 							type="button"
// 							className={classNames.googleButton}
// 							onClick={handleGoogleSignIn}
// 							disabled={loading}
// 						>
// 							<img
// 								src="https://fonts.gstatic.com/s/i/productlogos/googleg/v6/24px.svg"
// 								alt="Google"
// 								className={classNames.googleIcon}
// 							/>
// 							Sign in with Google
// 						</button>
//
// 						<div className={classNames.divider}>
// 							<hr />
// 						</div>
//
// 						<div className={classNames.formGroup}>
// 							<label htmlFor="email">Email address</label>
// 							<input
// 								id="email"
// 								type="email"
// 								placeholder="Your email address"
// 								value={email}
// 								onChange={(e) => setEmail(e.target.value)}
// 								required
// 							/>
// 						</div>
//
// 						<div className={classNames.formGroup}>
// 							<label htmlFor="password">Create a Password</label>
// 							<input
// 								id="password"
// 								type="password"
// 								placeholder="Your password"
// 								value={password}
// 								onChange={(e) => setPassword(e.target.value)}
// 								required
// 							/>
// 						</div>
//
// 						{error && <div className={classNames.errorMessage}>{error}</div>}
//
// 						<button
// 							type="submit"
// 							className={classNames.submitButton}
// 							disabled={loading}
// 						>
// 							{loading ? 'Signing up...' : 'Sign up'}
// 						</button>
//
// 						<div className={classNames.authLinks}>
// 							<a
// 								href="#sign-in"
// 								onClick={(e) => {
// 									e.preventDefault();
// 									setView('signIn');
// 								}}
// 							>
// 								Already have an account? Sign in
// 							</a>
// 						</div>
// 					</form>
// 				)}
//
// 				{/* Forgot Password View */}
// 				{view === 'forgotPassword' && (
// 					<form onSubmit={handleResetPassword}>
// 						<div className={classNames.formGroup}>
// 							<label htmlFor="email">Email address</label>
// 							<input
// 								id="email"
// 								type="email"
// 								placeholder="Your email address"
// 								value={email}
// 								onChange={(e) => setEmail(e.target.value)}
// 								required
// 							/>
// 						</div>
//
// 						{error && <div className={classNames.errorMessage}>{error}</div>}
//
// 						<button
// 							type="submit"
// 							className={classNames.submitButton}
// 							disabled={loading}
// 						>
// 							{loading ? 'Sending...' : 'Send reset password instructions'}
// 						</button>
//
// 						<div className={classNames.authLinks}>
// 							<a
// 								href="#sign-in"
// 								onClick={(e) => {
// 									e.preventDefault();
// 									setView('signIn');
// 								}}
// 							>
// 								Already have an account? Sign in
// 							</a>
// 						</div>
// 					</form>
// 				)}
// 			</div>
//
// 			<div className={classNames.authFooter}>
// 				<p>© {new Date().getFullYear()} Framna</p>
// 			</div>
// 		</div>
// 	);
// };
//
// export default AuthComponent;

import React, { useState, useEffect } from 'react';

import { AlertDialog, Button, Flex } from '@radix-ui/themes';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';

import { createClient } from '@/utils/supabase/client';

import classNames from './page.module.scss';

// Type definities voor formulier data
interface SignInFormData {
	email: string;
	password: string;
}

interface SignUpFormData {
	email: string;
	password: string;
}

enum AuthView {
	SIGN_IN,
	SIGN_UP,
	FORGOT_PASSWORD,
}

const AuthComponent: React.FC = () => {
	const [view, setView] = useState<AuthView>(AuthView.SIGN_IN);
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState<boolean>(false);

	const [showAlert, setShowAlert] = useState<boolean>(false);
	const [alertTitle, setAlertTitle] = useState<string>('Success');
	const [alertMessage, setAlertMessage] = useState<string>('');

	// React Hook Form setup voor de verschillende formulieren
	const signInForm = useForm<SignInFormData>();
	const signUpForm = useForm<SignUpFormData>();
	const forgotPasswordForm = useForm<{ email: string }>();

	const supabase = createClient();
	const router = useRouter();

	const AlertNotification = () => (
		<AlertDialog.Root open={showAlert} onOpenChange={setShowAlert}>
			<AlertDialog.Content maxWidth="450px">
				<AlertDialog.Title>{alertTitle}</AlertDialog.Title>
				<AlertDialog.Description size="2">
					{alertMessage}
				</AlertDialog.Description>

				<Flex gap="3" mt="4" justify="end">
					<AlertDialog.Action>
						<Button variant="solid" color="green">
							OK
						</Button>
					</AlertDialog.Action>
				</Flex>
			</AlertDialog.Content>
		</AlertDialog.Root>
	);

	// Reset error wanneer view verandert
	useEffect(() => {
		setError(null);
	}, [view]);

	// Google auth handler
	const handleGoogleSignIn = async () => {
		setLoading(true);
		setError(null);

		try {
			// Implementeer de Supabase Google auth functie
			const { error } = await supabase.auth.signInWithOAuth({
				provider: 'google',
			});

			if (error) throw error;
		} catch (error: any) {
			setError(
				error.message ||
					'Er is een fout opgetreden bij het inloggen met Google',
			);
		} finally {
			setLoading(false);
		}
	};

	// Email & password sign in handler
	const handleSignIn = async (data: SignInFormData) => {
		setLoading(true);
		setError(null);

		try {
			// Implementeer de Supabase email/password auth functie
			const { error } = await supabase.auth.signInWithPassword({
				email: data.email,
				password: data.password,
			});
			console.log('Error', error);
			if (error) throw error;
		} catch (error: any) {
			setError(error.message || 'Er is een fout opgetreden bij het inloggen');
		} finally {
			router.push('/profile');
			setLoading(false);
		}
	};

	// Sign up handler

	const handleSignUp = async (data: SignUpFormData) => {
		setLoading(true);
		setError(null);

		try {
			const { error } = await supabase.auth.signUp({
				email: data.email,
				password: data.password,
			});

			if (error) throw error;

			// Show success message with AlertDialog
			setAlertTitle('Verification Sent');
			setAlertMessage(
				'Verification email has been sent. Please check your inbox.',
			);
			setShowAlert(true);
		} catch (error: any) {
			setError(error.message || 'Error during sign up');
		} finally {
			setLoading(false);
		}
	};

	// Password reset handler
	const handlePasswordReset = async (data: { email: string }) => {
		setLoading(true);
		setError(null);

		try {
			const { error } = await supabase.auth.resetPasswordForEmail(data.email);

			if (error) throw error;

			setAlertTitle('Reset Instructions Sent');
			setAlertMessage(
				'Password reset instructions have been sent to your email.',
			);
			setShowAlert(true);
		} catch (error: any) {
			setError(error.message || 'Error sending reset instructions');
		} finally {
			setLoading(false);
		}
	};

	// Render het juiste formulier op basis van de huidige view
	const renderForm = () => {
		switch (view) {
			case AuthView.SIGN_IN:
				return (
					<>
						<h1 className={classNames.header}>
							Animation Playground <span className={classNames.stars}>✨</span>
						</h1>

						<button
							className={classNames.googleButton}
							onClick={handleGoogleSignIn}
							disabled={loading}
						>
							<span className={classNames.googleIcon}>
								<img
									src="https://fonts.gstatic.com/s/i/productlogos/googleg/v6/24px.svg"
									alt="Google"
									className={classNames.googleIcon}
								/>
							</span>
							Sign in with Google
						</button>

						<div className={classNames.divider}></div>

						<form onSubmit={signInForm.handleSubmit(handleSignIn)}>
							<label className={classNames.label}>Email address</label>
							<input
								className={classNames.input}
								type="email"
								placeholder="Your email address"
								required
								{...signInForm.register('email', { required: true })}
							/>

							<label className={classNames.label}>Your Password</label>
							<input
								className={classNames.input}
								type="password"
								placeholder="Your password"
								required
								{...signInForm.register('password', { required: true })}
							/>

							{error && <div className={classNames.error}>{error}</div>}

							<button
								className={classNames.button}
								type="submit"
								disabled={loading}
							>
								Sign in
							</button>
						</form>

						<a
							href="#"
							className={classNames.link}
							onClick={(e) => {
								e.preventDefault();
								setView(AuthView.FORGOT_PASSWORD);
							}}
						>
							Forgot your password?
						</a>

						<a
							href="#"
							className={classNames.link}
							onClick={(e) => {
								e.preventDefault();
								setView(AuthView.SIGN_UP);
							}}
						>
							Don&#39;t have an account? Sign up
						</a>
					</>
				);

			case AuthView.SIGN_UP:
				return (
					<>
						<h1 className={classNames.header}>
							Animation Playground <span className={classNames.stars}>✨</span>
						</h1>

						<button
							className={classNames.googleButton}
							onClick={handleGoogleSignIn}
							disabled={loading}
						>
							<span className={classNames.googleIcon}>
								<svg width="20" height="20" viewBox="0 0 24 24">
									<path
										fill="#4285F4"
										d="M21.8,10.4h-8.5v3.4h4.8c-0.5,2.3-2.2,3.4-4.8,3.4c-2.9,0-5.3-2.3-5.3-5.3s2.3-5.3,5.3-5.3c1.2,0,2.3,0.4,3.2,1.2 l2.5-2.5C17.3,3.6,15.3,3,13.3,3c-5,0-9,4-9,9s4,9,9,9c7,0,8.7-6.3,8-10.6C21.6,10.4,21.8,10.4,21.8,10.4z"
									/>
								</svg>
							</span>
							Sign in with Google
						</button>

						<div className={classNames.divider}></div>

						<form onSubmit={signUpForm.handleSubmit(handleSignUp)}>
							<label className={classNames.label}>Email address</label>
							<input
								className={classNames.input}
								type="email"
								placeholder="Your email address"
								{...signUpForm.register('email', { required: true })}
							/>

							<label className={classNames.label}>Create a Password</label>
							<input
								className={classNames.input}
								type="password"
								placeholder="Your password"
								{...signUpForm.register('password', {
									required: true,
									minLength: {
										value: 6,
										message: 'Password must be at least 6 characters',
									},
								})}
							/>

							{error && <div className={classNames.error}>{error}</div>}
							{signUpForm.formState.errors.password && (
								<div className={classNames.error}>
									{signUpForm.formState.errors.password.message}
								</div>
							)}

							<button
								className={classNames.button}
								type="submit"
								disabled={loading}
							>
								Sign up
							</button>
						</form>

						<a
							href="#"
							className={classNames.link}
							onClick={(e) => {
								e.preventDefault();
								setView(AuthView.SIGN_IN);
							}}
						>
							Already have an account? Sign in
						</a>
					</>
				);

			case AuthView.FORGOT_PASSWORD:
				return (
					<>
						<h1 className={classNames.header}>
							Animation Playground <span className={classNames.stars}>✨</span>
						</h1>

						<form
							onSubmit={forgotPasswordForm.handleSubmit(handlePasswordReset)}
						>
							<label className={classNames.label}>Email address</label>
							<input
								className={classNames.input}
								type="email"
								placeholder="Your email address"
								{...forgotPasswordForm.register('email', { required: true })}
							/>

							{error && <div className={classNames.error}>{error}</div>}

							<button
								className={classNames.button}
								type="submit"
								disabled={loading}
							>
								Send reset password instructions
							</button>
						</form>

						<a
							href="#"
							className={classNames.link}
							onClick={(e) => {
								e.preventDefault();
								setView(AuthView.SIGN_IN);
							}}
						>
							Already have an account? Sign in
						</a>
					</>
				);
		}
	};

	return (
		<div className={classNames.container}>
			{renderForm()}
			<div className={classNames.footer}>© 2025 Framna</div>
			<AlertNotification />
		</div>
	);
};

export default AuthComponent;
