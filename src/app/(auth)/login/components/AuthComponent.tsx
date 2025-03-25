'use client';
import React, { useState, useEffect } from 'react';

type AuthView = 'signIn' | 'signUp' | 'forgotPassword';
import { createClient } from '@/utils/supabase/client';

import styles from './page.module.scss';

const AuthComponent: React.FC = () => {
	const [view, setView] = useState<AuthView>('signIn');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const supabase = createClient();
	// Reset error when view changes
	useEffect(() => {
		setError(null);
	}, [view]);

	// Sign in with email and password
	const handleEmailSignIn = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError(null);

		try {
			// Implement Supabase sign-in logic here
			const { error } = await supabase.auth.signInWithPassword({
				email,
				password,
			});

			if (error) throw error;
			// Handle successful sign-in (redirect, etc.)
		} catch (err: any) {
			setError(err.message || 'Error signing in');
		} finally {
			setLoading(false);
		}
	};

	// Sign up with email and password
	const handleEmailSignUp = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError(null);

		try {
			// Implement Supabase sign-up logic here
			const { error } = await supabase.auth.signUp({
				email,
				password,
			});

			if (error) throw error;
			// Handle successful sign-up (redirect, email confirmation message, etc.)
		} catch (err: any) {
			setError(err.message || 'Error signing up');
		} finally {
			setLoading(false);
		}
	};

	// Sign in with Google
	const handleGoogleSignIn = async () => {
		setLoading(true);
		setError(null);

		try {
			// Implement Supabase Google sign-in logic here
			const { error } = await supabase.auth.signInWithOAuth({
				provider: 'google',
				options: {
					redirectTo: `${window.location.origin}/profile`, // Add your redirect URL
				},
			});

			if (error) throw error;
		} catch (err: any) {
			setError(err.message || 'Error signing in with Google');
			setLoading(false);
		}
	};

	// Reset password
	const handleResetPassword = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError(null);

		try {
			// Implement Supabase password reset logic here
			const { error } = await supabase.auth.resetPasswordForEmail(email, {
				redirectTo: `${window.location.origin}/reset-password`,
			});

			if (error) throw error;
			// Handle successful reset request (show message, etc.)
		} catch (err: any) {
			setError(err.message || 'Error sending password reset instructions');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className={styles.authContainer}>
			<div className={styles.authHeader}>
				<h1>Animation Playground ✨</h1>
			</div>

			<div className={styles.authContent}>
				{/* Sign In View */}
				{view === 'signIn' && (
					<form onSubmit={handleEmailSignIn}>
						<button
							type="button"
							className={styles.googleButton}
							onClick={handleGoogleSignIn}
							disabled={loading}
						>
							<img
								src="https://fonts.gstatic.com/s/i/productlogos/googleg/v6/24px.svg"
								alt="Google"
								className={styles.googleIcon}
							/>
							Sign in with Google
						</button>

						<div className={styles.divider}>
							<hr />
						</div>

						<div className={styles.formGroup}>
							<label htmlFor="email">Email address</label>
							<input
								id="email"
								type="email"
								placeholder="Your email address"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
							/>
						</div>

						<div className={styles.formGroup}>
							<label htmlFor="password">Your Password</label>
							<input
								id="password"
								type="password"
								placeholder="Your password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
							/>
						</div>

						{error && <div className={styles.errorMessage}>{error}</div>}

						<button
							type="submit"
							className={styles.submitButton}
							disabled={loading}
						>
							{loading ? 'Signing in...' : 'Sign in'}
						</button>

						<div className={styles.authLinks}>
							<a
								href="#forgot-password"
								onClick={(e) => {
									e.preventDefault();
									setView('forgotPassword');
								}}
							>
								Forgot your password?
							</a>

							<a
								href="#sign-up"
								onClick={(e) => {
									e.preventDefault();
									setView('signUp');
								}}
							>
								Don't have an account? Sign up
							</a>
						</div>
					</form>
				)}

				{/* Sign Up View */}
				{view === 'signUp' && (
					<form onSubmit={handleEmailSignUp}>
						<button
							type="button"
							className={styles.googleButton}
							onClick={handleGoogleSignIn}
							disabled={loading}
						>
							<img
								src="https://fonts.gstatic.com/s/i/productlogos/googleg/v6/24px.svg"
								alt="Google"
								className={styles.googleIcon}
							/>
							Sign in with Google
						</button>

						<div className={styles.divider}>
							<hr />
						</div>

						<div className={styles.formGroup}>
							<label htmlFor="email">Email address</label>
							<input
								id="email"
								type="email"
								placeholder="Your email address"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
							/>
						</div>

						<div className={styles.formGroup}>
							<label htmlFor="password">Create a Password</label>
							<input
								id="password"
								type="password"
								placeholder="Your password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
							/>
						</div>

						{error && <div className={styles.errorMessage}>{error}</div>}

						<button
							type="submit"
							className={styles.submitButton}
							disabled={loading}
						>
							{loading ? 'Signing up...' : 'Sign up'}
						</button>

						<div className={styles.authLinks}>
							<a
								href="#sign-in"
								onClick={(e) => {
									e.preventDefault();
									setView('signIn');
								}}
							>
								Already have an account? Sign in
							</a>
						</div>
					</form>
				)}

				{/* Forgot Password View */}
				{view === 'forgotPassword' && (
					<form onSubmit={handleResetPassword}>
						<div className={styles.formGroup}>
							<label htmlFor="email">Email address</label>
							<input
								id="email"
								type="email"
								placeholder="Your email address"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
							/>
						</div>

						{error && <div className={styles.errorMessage}>{error}</div>}

						<button
							type="submit"
							className={styles.submitButton}
							disabled={loading}
						>
							{loading ? 'Sending...' : 'Send reset password instructions'}
						</button>

						<div className={styles.authLinks}>
							<a
								href="#sign-in"
								onClick={(e) => {
									e.preventDefault();
									setView('signIn');
								}}
							>
								Already have an account? Sign in
							</a>
						</div>
					</form>
				)}
			</div>

			<div className={styles.authFooter}>
				<p>© {new Date().getFullYear()} Framna</p>
			</div>
		</div>
	);
};

export default AuthComponent;
