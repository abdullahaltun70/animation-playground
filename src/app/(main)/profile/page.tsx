'use client';

import React, { useEffect, useState } from 'react';

import { CopyIcon } from '@radix-ui/react-icons';
import {
	Box,
	Button,
	Dialog,
	Flex,
	Heading,
	Tabs,
	Text,
} from '@radix-ui/themes';
import { useRouter } from 'next/navigation';

import AlertNotification from '@/app/(auth)/login/components/AlertComponent';
import { ConfigCard } from '@/components/config-card/ConfigCard';
import { ConfigModel } from '@/types/animations';
import { createClient } from '@/utils/supabase/client';

import styles from './Profile.module.scss';

// TODO: REFACTOR THIS COMPONENT AND IMPLEMENT THE
//  CONFIGLIST COMPONENT
export default function ProfilePage() {
	const router = useRouter();
	const [allConfigs, setAllConfigs] = useState<ConfigModel[]>([]);
	const [userConfigs, setUserConfigs] = useState<ConfigModel[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [shareDialogOpen, setShareDialogOpen] = useState(false);
	const [shareUrl, setShareUrl] = useState('');
	const [copySuccess, setCopySuccess] = useState(false);
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [checkingAuth, setCheckingAuth] = useState(true);

	const [isDeleting, setIsDeleting] = useState(false);
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const [configToDeleteId, setConfigToDeleteId] = useState<string | null>(null);
	const [authorName, setAuthorName] = useState('');

	const fetchAllConfigs = async () => {
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
				throw new Error('Failed to fetch All configurations');
			}

			const data = await response.json();

			// Check if the data is directly an array or has a configs property
			if (Array.isArray(data)) {
				// API is returning an array directly
				setAllConfigs(data);
			} else if (data.configs && Array.isArray(data.configs)) {
				// API is returning an object with a configs property
				setAllConfigs(data.configs);
			} else {
				// Unexpected format, log but don't error
				console.warn(
					'Unexpected response structure, but trying to handle gracefully:',
					data,
				);
				setAllConfigs([]); // Set to empty array to avoid errors in UI
			}
		} catch (err: any) {
			console.error('Error fetching All configurations:', err);
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	const fetchUserConfigs = async () => {
		setLoading(true);
		setError(null);

		try {
			// Include credentials to ensure cookies are sent with the request
			const response = await fetch('/api/configs/my-configs', {
				credentials: 'include',
				headers: {
					'Content-Type': 'application/json',
				},
			});

			if (response.status === 401) {
				// If unauthorized, redirect to login
				router.push('/login?redirectTo=/profile');
				return;
			}

			if (!response.ok) {
				throw new Error('Failed to fetch User configurations');
			}

			const data = await response.json();
			// Extract the configs array from the response
			if (data.configs && Array.isArray(data.configs)) {
				setUserConfigs(data.configs);
			} else if (Array.isArray(data)) {
				setUserConfigs(data);
			} else {
				// If the response structure is different than expected
				console.warn('Unexpected response structure:', data);
				setUserConfigs(Array.isArray(data) ? data : []);
			}
		} catch (err: any) {
			console.error('Error fetching User configurations:', err);
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
			setUserConfigs(
				userConfigs.filter((config) => config.id !== configToDeleteId),
			);
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
		fetchAllConfigs();
		fetchUserConfigs();
	};

	// Check if user is authenticated before loading any data
	useEffect(() => {
		const checkAuth = async () => {
			try {
				setCheckingAuth(true);
				const supabase = createClient();
				const {
					data: { user },
				} = await supabase.auth.getUser();
				setAuthorName(user?.user_metadata.name);

				if (!user) {
					// If no session, redirect to login
					console.log('No authentication session found, redirecting to login');
					router.push('/login?redirectTo=/profile');
					return;
				}

				setIsAuthenticated(true);
				// Once authenticated, fetch the data
				fetchAllConfigs();
				fetchUserConfigs();
			} catch (err) {
				console.error('Error checking authentication:', err);
				setError('Authentication error. Please try logging in again.');
			} finally {
				setCheckingAuth(false);
			}
		};

		checkAuth();
	}, [router]);

	// Set up auth state change listener
	useEffect(() => {
		const supabase = createClient();

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((event, session) => {
			if (event === 'SIGNED_OUT' || !session) {
				// If signed out during the session, redirect to login
				router.push('/login?redirectTo=/profile');
			}
		});

		// Clean up subscription
		return () => {
			subscription.unsubscribe();
		};
	}, [router]);

	// Show loading state when checking authentication
	if (checkingAuth) {
		return <Box className={styles.authMessage}>Checking authentication...</Box>;
	}

	// Only render the profile content if authenticated
	if (!isAuthenticated) {
		return (
			<Box className={styles.authMessage}>
				<Text size="4">You must be logged in to view this page</Text>
				<Button
					mt="4"
					onClick={() => router.push('/login?redirectTo=/profile')}
				>
					Go to Login
				</Button>
			</Box>
		);
	}

	return (
		<div className={styles.profileContainer}>
			<Tabs.Root defaultValue="my-configs">
				<Tabs.List>
					<Tabs.Trigger value="my-configs">My Configurations</Tabs.Trigger>
					<Tabs.Trigger value="all-configs">All Configurations</Tabs.Trigger>
				</Tabs.List>

				<Box pt="3">
					<Tabs.Content value="my-configs">
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
						) : userConfigs.length === 0 ? (
							<Box className={styles.emptyState}>
								<Text size="3">
									You don&#39;t have any saved configurations yet.
								</Text>
								<Button mt="3" onClick={() => router.push('/playground')}>
									Create Your First Animation
								</Button>
							</Box>
						) : (
							<Flex direction="column" gap="3">
								{userConfigs.map((config) => (
									<ConfigCard
										key={config.id}
										config={config}
										onDeleteAction={handleDeleteRequest}
										onShareAction={handleShare}
										authorName={authorName}
									/>
								))}
							</Flex>
						)}
					</Tabs.Content>

					<Tabs.Content value="all-configs">
						<Heading size="6" mb="4">
							All Animation Configurations
						</Heading>

						{error && (
							<Box className={styles.errorMessage} mb="4">
								{error}
								<Button onClick={handleRetry}>Retry</Button>
							</Box>
						)}

						{loading ? (
							<Box className={styles.loadingIndicator}>
								Loading All configurations...
							</Box>
						) : allConfigs.length === 0 ? (
							<Box className={styles.emptyState}>
								<Text size="3">
									{`
									No One has saved any configurations yet 😢
									Please create your first configuration to start sharing! 
									`}
								</Text>
								<Button
									mt="3"
									onClick={() => (window.location.href = '/playground')}
								>
									Create Your First Animation
								</Button>
							</Box>
						) : (
							<Flex direction="column" gap="3">
								{allConfigs.map((config) => (
									<ConfigCard
										key={config.id}
										config={config}
										onDeleteAction={handleDeleteRequest}
										onShareAction={handleShare}
										authorName={authorName}
									/>
								))}
							</Flex>
						)}
					</Tabs.Content>
				</Box>
			</Tabs.Root>

			{/* Share Dialog */}
			<Dialog.Root open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
				<Dialog.Content>
					<Dialog.Title>Share Animation Configuration</Dialog.Title>
					<Dialog.Description>
						Anyone with this link can view this animation configuration.
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
				alertMessage={`Are you sure you want to delete the configuration: ${userConfigs.find((c) => c.id === configToDeleteId)?.title ?? ''} ? This action cannot be undone.`}
				onConfirm={handleConfirmDelete}
				confirmButtonText={isDeleting ? 'Deleting...' : 'Delete'}
			/>
		</div>
	);
}
