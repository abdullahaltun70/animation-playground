'use client';

import React, { useEffect, useState } from 'react';

import { CopyIcon } from '@radix-ui/react-icons';
import { Box, Button, Dialog, Flex, Heading, Text } from '@radix-ui/themes';

import AlertNotification from '@/app/(auth)/login/components/AlertComponent';
import { ConfigCard } from '@/components/config-card/ConfigCard';
import { ConfigModel } from '@/types/animations';

import styles from './Profile.module.scss';

export default function ProfilePage() {
	const [configs, setConfigs] = useState<ConfigModel[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [shareDialogOpen, setShareDialogOpen] = useState(false);
	const [shareUrl, setShareUrl] = useState('');
	const [copySuccess, setCopySuccess] = useState(false);

	const [isDeleting, setIsDeleting] = useState(false);
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const [configToDeleteId, setConfigToDeleteId] = useState<string | null>(null);

	// Fetch user's saved configurations
	useEffect(() => {
		fetchConfigs();
	}, []);

	const fetchConfigs = async () => {
		setLoading(true);
		setError(null);

		try {
			// Include credentials to ensure cookies are sent with the request
			const response = await fetch('/api/configs', {
				credentials: 'include',
				headers: {
					'Content-Type': 'application/json',
				},
			});

			if (!response.ok) {
				throw new Error('Failed to fetch configurations');
			}

			const data = await response.json();
			console.log('Configs fetched successfully: ', data);
			setConfigs(data);
		} catch (err: any) {
			console.error('Error fetching configurations:', err);
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	// Handler to prepare deletion and show confirmation
	const handleDeleteRequest = (id: string) => {
		setConfigToDeleteId(id);
		setShowDeleteConfirm(true);
	};

	// Function to actually delete the config after confirmation
	const handleConfirmDelete = async () => {
		if (!configToDeleteId) return;

		setIsDeleting(true);

		try {
			const response = await fetch(`/api/configs/${configToDeleteId}`, {
				method: 'DELETE',
				credentials: 'include', // Include credentials for authentication
			});

			if (!response.ok) {
				throw new Error('Failed to delete configuration');
			}

			// Remove the deleted config from the state
			setConfigs(configs.filter((config) => config.id !== configToDeleteId));
			setShowDeleteConfirm(false);
		} catch (err: any) {
			console.error('Error deleting config:', err);
			setError(err.message);
		} finally {
			setIsDeleting(false);
			setConfigToDeleteId(null);
		}
	};

	const handleShare = (id: string) => {
		// Generate shareable URL
		const url = new URL(window.location.origin);
		url.pathname = '/playground';
		url.searchParams.set('id', id);

		setShareUrl(url.toString());
		setShareDialogOpen(true);
	};

	const handleCopyUrl = () => {
		navigator.clipboard
			.writeText(shareUrl)
			.then(() => {
				setCopySuccess(true);
				setTimeout(() => setCopySuccess(false), 2000);
			})
			.catch((err) => {
				console.error('Failed to copy URL:', err);
				setError('Failed to copy URL to clipboard');
			});
	};

	const handleRetry = () => {
		fetchConfigs();
	};

	return (
		<div className={styles.profileContainer}>
			<Heading size="6" mb="4">
				My Animation Configurations
			</Heading>

			{error && (
				<Box className={styles.errorMessage} mb="4">
					{error}
					<Button onClick={handleRetry}>Retry</Button>
				</Box>
			)}

			{loading ? (
				<Box className={styles.loadingIndicator}>
					Loading your configurations...
				</Box>
			) : configs.length === 0 ? (
				<Box className={styles.emptyState}>
					<Text size="3">You don&#39;t have any saved configurations yet.</Text>
					<Button mt="3" onClick={() => (window.location.href = '/playground')}>
						Create Your First Animation
					</Button>
				</Box>
			) : (
				<Flex direction="column" gap="3">
					{configs.map((config) => (
						<ConfigCard
							key={config.id}
							config={config}
							onDeleteAction={handleDeleteRequest}
							onShareAction={handleShare}
						/>
					))}
				</Flex>
			)}

			{/* Share Dialog */}
			<Dialog.Root open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
				<Dialog.Content>
					<Dialog.Title>Share Animation Configuration</Dialog.Title>
					<Dialog.Description>
						Anyone with this link can view and edit this animation
						configuration.
					</Dialog.Description>

					<Flex gap="3" mt="4">
						<input
							type="text"
							value={shareUrl}
							readOnly
							className={styles.shareInput}
						/>
						<Button
							onClick={handleCopyUrl}
							style={{
								cursor: 'pointer',
							}}
						>
							<CopyIcon /> Copy
						</Button>
					</Flex>

					{copySuccess && (
						<Text color="green" mt="2">
							URL copied to clipboard!
						</Text>
					)}

					<Flex gap="3" mt="4" justify="end">
						<Dialog.Close>
							<Button variant="soft">Close</Button>
						</Dialog.Close>
					</Flex>
				</Dialog.Content>
			</Dialog.Root>
			<AlertNotification
				showAlert={showDeleteConfirm}
				setShowAlert={setShowDeleteConfirm}
				alertTitle="Confirm Deletion"
				alertMessage={`Are you sure you want to delete the configuration: ${configs.find((c) => c.id === configToDeleteId)?.title ?? ''} ? This action cannot be undone.`}
				onConfirm={handleConfirmDelete}
				confirmButtonText={isDeleting ? 'Deleting...' : 'Delete'}
			/>
		</div>
	);
}
