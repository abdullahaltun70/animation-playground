// app/(main)/profile/ProfileClientPage.tsx
'use client';

import React, { FormEvent, useState } from 'react';

import { Pencil2Icon } from '@radix-ui/react-icons';
import { Card } from '@radix-ui/themes';
import { Trash2Icon } from 'lucide-react';
import Image from 'next/image';
import { Toast } from 'radix-ui';

import AlertNotification from '@/app/(auth)/login/components/AlertComponent';
import { SignOutButton } from '@/components/profile/SignOutButton';
import type { Config } from '@/db/schema';
import { removeConfig, saveConfig } from '@/utils/actions/supabase/configs';

import styles from './page.module.scss';

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
	const [errorConfigs] = useState<string | null>(initialError);
	const [configTitle, setConfigTitle] = useState('');
	const [configDesc, setConfigDesc] = useState('');
	const [configDataString, setConfigDataString] = useState('');
	const [toastMessage, setToastMessage] = useState('');
	const [isPending, setIsPending] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false); // Optional: for delete loading state
	const [toastOpen, setToastOpen] = useState(false); // Renamed from 'open' for clarity

	// --- State for Delete Confirmation ---
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const [configToDeleteId, setConfigToDeleteId] = useState<string | null>(null);
	// ------------------------------------

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
			setToastOpen(true); // Use dedicated state for toast

			if (result.success && result.data) {
				// Update configs correctly: Prepend new config
				setConfigs((prevConfigs) => [...(result.data ?? []), ...prevConfigs]);
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
			setToastOpen(true); // Use dedicated state for toast
		} finally {
			setIsPending(false);
		}
	}

	/**
	 * Initiates the delete confirmation process.
	 * Sets the config ID to be deleted and opens the confirmation dialog.
	 */
	function handleDeleteInitiate(configId: string) {
		setConfigToDeleteId(configId); // Store the ID of the config to delete
		setShowDeleteConfirm(true); // Show the confirmation dialog
	}

	/**
	 * Handles the actual deletion after confirmation.
	 * Called by the AlertNotification's onConfirm prop.
	 */
	async function handleConfirmDelete() {
		if (!configToDeleteId) {
			console.error('Delete confirmed but no config ID was set.');
			setToastMessage('Error: Config ID missing for deletion.');
			setToastOpen(true);
			setShowDeleteConfirm(false); // Close dialog even if error
			return;
		}

		setIsDeleting(true); // Optional: indicate deletion is in progress
		setToastMessage(''); // Clear previous toast

		try {
			const result = await removeConfig(configToDeleteId);
			setToastMessage(result.message);
			setToastOpen(true);

			if (result.success) {
				// Filter out the deleted config from the local state
				setConfigs((prevConfigs) =>
					prevConfigs.filter((c) => c.id !== configToDeleteId),
				);
			}
		} catch (error) {
			console.error('Error deleting config:', error);
			setToastMessage(
				error instanceof Error
					? `Error: ${error.message}`
					: 'An unknown error occurred',
			);
			setToastOpen(true);
		} finally {
			// Reset state regardless of outcome
			setShowDeleteConfirm(false); // Ensure dialog is closed
			setConfigToDeleteId(null); // Clear the stored ID
			setIsDeleting(false); // Optional: reset deletion loading state
		}
	}

	return (
		// Use Toast.Provider at a higher level if possible, or ensure it wraps the Toast components
		<Toast.Provider swipeDirection="right">
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
							<label htmlFor="configData">Config Data:</label>
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
								open={toastOpen}
								onOpenChange={setToastOpen}
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

				{/* Toast Components */}
				<Toast.Root
					className={styles.ToastRoot}
					open={toastOpen} // Use dedicated state
					onOpenChange={setToastOpen} // Use dedicated state setter
				>
					<Toast.Title className={styles.ToastTitle}>Message</Toast.Title>
					<Toast.Description className={styles.ToastDescription}>
						{toastMessage}
					</Toast.Description>
					<Toast.Action asChild altText="Close">
						<button
							className={`${styles.ToastButton} ${styles.green} ${styles.small}`}
						>
							{' '}
							{/* Combine styles correctly */}
							Close
						</button>
					</Toast.Action>
				</Toast.Root>
				<Toast.Viewport className={styles.ToastViewport} />
				{/* End Toast Components */}

				<div className={styles.configsList}>
					<h2>Your Configs</h2>
					{errorConfigs ? (
						<p className={styles.error}>{errorConfigs}</p>
					) : configs.length > 0 ? (
						<div className={styles.grid}>
							{configs.map((config) => (
								<Card className={styles.card} key={config.id}>
									<div className={styles.contentArea}>
										<h3>{config.title}</h3>
										{config.description && <p>{config.description}</p>}
										<p className={styles.date}>
											Created: {new Date(config.createdAt).toDateString()}
										</p>
									</div>
									<div className={styles.actionIcons}>
										<Trash2Icon
											role={'button'}
											className={styles.iconButton} // Add styling if needed
											size={30}
											onClick={() => handleDeleteInitiate(config.id)} // Call the initiation function
											aria-label={`Delete config ${config.title}`}
										/>
										<Pencil2Icon
											role={'button'}
											className={styles.iconButton} // Add styling if needed
											height={30}
											width={30}
											onClick={() => {
												// TODO: Implement edit config logic here
												console.log('Edit config:', config);
											}}
											aria-label={`Edit config ${config.title}`}
										/>
									</div>
								</Card>
							))}
						</div>
					) : (
						<h3>No configs yet. Create your first config above!</h3>
					)}
				</div>

				{/* Delete Confirmation Dialog */}
				<AlertNotification
					showAlert={showDeleteConfirm}
					setShowAlert={setShowDeleteConfirm}
					alertTitle="Confirm Deletion"
					alertMessage={`Are you sure you want to delete the configuration "${configs.find((c) => c.id === configToDeleteId)?.title ?? ''}"? This action cannot be undone.`}
					onConfirm={handleConfirmDelete} // Pass the actual delete handler
					confirmButtonText={isDeleting ? 'Deleting...' : 'Delete'} // Show loading state
					// Optionally disable buttons while deleting if needed, though Radix might handle this
				/>
			</div>
		</Toast.Provider> // Close Toast.Provider
	);
}
