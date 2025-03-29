// app/(main)/profile/ProfileClientPage.tsx
'use client';

import React, { useState, FormEvent } from 'react';

import Image from 'next/image';
import { Toast } from 'radix-ui';

import { SignOutButton } from '@/components/profile/SignOutButton';
import type { Config } from '@/db/queries/config';
import { saveConfig } from '@/utils/actions/supabase/configs';

import styles from './page.module.scss';

// Client component props met expliciete types
interface ProfileClientPageProps {
	userInfo: {
		id: string;
		email: string;
		name: string;
		avatar_url?: string;
	};
	initialConfigs: Config[];
	initialError: string | null;
}

export default function ProfileClientPage({
	userInfo,
	initialConfigs,
	initialError,
}: ProfileClientPageProps) {
	const [configs, setConfigs] = useState<Config[]>(initialConfigs);
	const [errorConfigs, setErrorConfigs] = useState<string | null>(initialError);
	const [configTitle, setConfigTitle] = useState('');
	const [configDesc, setConfigDesc] = useState('');
	const [configDataString, setConfigDataString] = useState('');
	const [toastMessage, setToastMessage] = useState('');
	const [isPending, setIsPending] = useState(false);

	const [open, setOpen] = useState(false);

	// Handler for form submission
	async function handleSaveConfig(e: FormEvent) {
		e.preventDefault();
		setIsPending(true);
		setToastMessage('');

		try {
			const result = await saveConfig(
				configTitle,
				configDesc || null,
				configDataString || null,
			);

			setToastMessage(result.message);
			setOpen(true);

			if (result.success && result.data) {
				// Voeg nieuwe config toe aan de lijst
				setConfigs([...result.data, ...configs]);
				// Reset form fields on success
				setConfigTitle('');
				setConfigDesc('');
				setConfigDataString('');
			}
		} catch (error) {
			console.error('Error saving config:', error);
			setToastMessage(
				error instanceof Error
					? `Error: ${error.message}`
					: 'An unknown error occurred',
			);
			setOpen(true);
		} finally {
			setIsPending(false);
		}
	}

	return (
		<div className={styles.profileContainer}>
			<h1>Profile</h1>

			{userInfo && (
				<div className={styles.userInfo}>
					<h2>Welcome, {userInfo.name}</h2>
					<p>Email: {userInfo.email}</p>
					{userInfo.avatar_url && (
						<Image
							src={userInfo.avatar_url}
							alt="Profile"
							className={styles.avatar}
							width={64}
							height={64}
						/>
					)}
					<SignOutButton />
				</div>
			)}

			<div className={styles.configForm}>
				<h2>Create New Config</h2>
				<form onSubmit={handleSaveConfig}>
					<div className={styles.formGroup}>
						<label htmlFor="configTitle">Title:</label>
						<input
							id="configTitle"
							type="text"
							value={configTitle}
							onChange={(e) => setConfigTitle(e.target.value)}
							required
							className={styles.input}
						/>
					</div>

					<div className={styles.formGroup}>
						<label htmlFor="configDesc">Description:</label>
						<textarea
							id="configDesc"
							value={configDesc}
							onChange={(e) => setConfigDesc(e.target.value)}
							className={styles.textarea}
						/>
					</div>

					<div className={styles.formGroup}>
						<label htmlFor="configData">Config Data (JSON):</label>
						<textarea
							id="configData"
							value={configDataString}
							onChange={(e) => setConfigDataString(e.target.value)}
							className={styles.textarea}
							rows={5}
						/>
					</div>

					<Toast.Provider swipeDirection="right" duration={1000000}>
						<button
							type="submit"
							disabled={isPending}
							className={styles.submitButton}
						>
							{isPending ? 'Saving...' : 'Save Config'}
						</button>

						<Toast.Root
							className={styles.ToastRoot}
							open={open}
							onOpenChange={setOpen}
						>
							<Toast.Title className={styles.ToastTitle}>Message</Toast.Title>
							<Toast.Description className={styles.ToastDescription}>
								{toastMessage}
							</Toast.Description>
							<Toast.Action asChild altText="Close">
								<button className={`${styles.ToastButton} green small`}>
									Close
								</button>
							</Toast.Action>
						</Toast.Root>
						<Toast.Viewport className={styles.ToastViewport} />
					</Toast.Provider>
				</form>
			</div>

			<div className={styles.configsList}>
				<h2>Your Configs</h2>
				{errorConfigs ? (
					<p className={styles.error}>{errorConfigs}</p>
				) : configs.length > 0 ? (
					<div className={styles.grid}>
						{configs.map((config) => (
							<div key={config.id} className={styles.configCard}>
								<h3>{config.title}</h3>
								{config.description && <p>{config.description}</p>}
								<p className={styles.date}>
									Created: {new Date(config.created_at).toLocaleDateString()}
								</p>
							</div>
						))}
					</div>
				) : (
					<p>No configs yet. Create your first config above!</p>
				)}
			</div>
		</div>
	);
}
