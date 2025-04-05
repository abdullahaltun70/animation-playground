'use client';

import React, { useState, useEffect, useCallback } from 'react';

import { Share1Icon, CopyIcon, CodeIcon } from '@radix-ui/react-icons';
import {
	Box,
	Flex,
	Button,
	Dialog,
	TextField,
	Text,
	IconButton,
	Tabs,
} from '@radix-ui/themes';
import { useRouter, useSearchParams } from 'next/navigation';

import { AnimatedContainer } from '@/components/animated-container/AnimatedContainer';
import { ConfigPanel } from '@/components/config-panel/ConfigPanel';
import { AnimationConfig } from '@/types/animations';
import { generateCSSCode, generateReactComponent } from '@/utils/animations';
import { createClient } from '@/utils/supabase/client';

import styles from './page.module.scss';

export default function PlaygroundPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const configId = searchParams.get('id');

	const [animationConfig, setAnimationConfig] = useState<AnimationConfig>({
		type: 'fade',
		duration: 0.5,
		delay: 0,
		easing: 'ease-out',
		distance: 50,
		degrees: 360,
		scale: 0.8,
		opacity: {
			start: 0,
			end: 1,
		},
		name: '',
		description: '',
	});

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [shareDialogOpen, setShareDialogOpen] = useState(false);
	const [exportDialogOpen, setExportDialogOpen] = useState(false);
	const [shareUrl, setShareUrl] = useState('');
	const [copySuccess, setCopySuccess] = useState(false);
	const [exportTab, setExportTab] = useState('react');
	const [configLoaded, setConfigLoaded] = useState(false);

	// Load configuration from URL if configId is present
	useEffect(() => {
		if (configId) {
			setLoading(true);
			setConfigLoaded(false);

			fetch(`/api/configs/${configId}`, {
				credentials: 'include', // Include credentials for authentication
			})
				.then((response) => {
					if (!response.ok) {
						throw new Error('Failed to load configuration');
					}
					return response.json();
				})
				.then((data) => {
					if (data.configData) {
						try {
							const parsedConfig = JSON.parse(data.configData);
							console.log('Loaded config:', parsedConfig);

							// Ensure all required properties are present
							const loadedConfig: AnimationConfig = {
								type: parsedConfig.type || 'fade',
								duration: parsedConfig.duration || 0.5,
								delay: parsedConfig.delay || 0,
								easing: parsedConfig.easing || 'ease-out',
								distance:
									parsedConfig.distance !== undefined
										? parsedConfig.distance
										: 50,
								degrees:
									parsedConfig.degrees !== undefined
										? parsedConfig.degrees
										: 360,
								scale:
									parsedConfig.scale !== undefined ? parsedConfig.scale : 0.8,
								opacity: parsedConfig.opacity || { start: 0, end: 1 },
								name: parsedConfig.name || data.title || '',
								description: parsedConfig.description || data.description || '',
							};

							setAnimationConfig(loadedConfig);
							setConfigLoaded(true);
						} catch (e) {
							console.error('Error parsing configuration data:', e);
							setError('Invalid configuration data');
						}
					}
				})
				.catch((err) => {
					console.error('Error loading configuration:', err);
					setError(err.message);
				})
				.finally(() => {
					setLoading(false);
				});
		}
	}, [configId]);

	const handleConfigChange = useCallback((newConfig: AnimationConfig) => {
		setAnimationConfig(newConfig);
	}, []);

	const handleSave = async (config: AnimationConfig) => {
		if (!config.name) {
			setError('Please provide a name for your configuration');
			return;
		}

		setLoading(true);
		setError(null);

		try {
			// Check if user is authenticated
			const supabase = createClient();
			const {
				data: { session },
			} = await supabase.auth.getSession();

			if (!session) {
				setError('You must be logged in to save configurations');
				setLoading(false);
				return;
			}

			const method = configId ? 'PUT' : 'POST';
			const url = configId ? `/api/configs/${configId}` : '/api/configs';

			const response = await fetch(url, {
				method,
				headers: {
					'Content-Type': 'application/json',
				},
				credentials: 'include', // Include credentials for authentication
				body: JSON.stringify({
					title: config.name,
					description: config.description || '',
					configData: JSON.stringify(config),
				}),
			});

			if (!response.ok) {
				throw new Error(
					`Failed to ${configId ? 'update' : 'save'} configuration`,
				);
			}

			const data = await response.json();

			// Redirect to the configuration with its ID in the URL if it's a new configuration
			if (!configId) {
				router.push(`/playground?id=${data.id}`);
			}
		} catch (err: any) {
			console.error('Error saving configuration:', err);
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	const handleReset = () => {
		// Reset to default configuration
		setAnimationConfig({
			type: 'fade',
			duration: 0.5,
			delay: 0,
			easing: 'ease-out',
			distance: 50,
			degrees: 360,
			scale: 0.8,
			opacity: {
				start: 0,
				end: 1,
			},
			name: '',
			description: '',
		});

		// Remove the id from URL if present
		if (configId) {
			router.push('/playground');
		}
	};

	const handleShare = () => {
		if (!configId) {
			setError('Please save your configuration before sharing');
			return;
		}

		// Generate shareable URL
		const url = new URL(window.location.href);
		setShareUrl(url.toString());
		setShareDialogOpen(true);
	};

	const handleExport = () => {
		setExportDialogOpen(true);
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

	const handleCopyCode = () => {
		const code =
			exportTab === 'css'
				? generateCSSCode(animationConfig)
				: generateReactComponent(animationConfig);

		navigator.clipboard
			.writeText(code)
			.then(() => {
				setCopySuccess(true);
				setTimeout(() => setCopySuccess(false), 2000);
			})
			.catch((err) => {
				console.error('Failed to copy code:', err);
				setError('Failed to copy code to clipboard');
			});
	};

	return (
		<div className={styles.pageContainer}>
			{error && (
				<div className={styles.errorMessage}>
					{error}
					<Button onClick={() => setError(null)}>Dismiss</Button>
				</div>
			)}

			{loading && <div className={styles.loadingIndicator}>Loading...</div>}

			<Flex className={styles.container}>
				{/* Left side - Animation Preview Area */}
				<Box className={styles.animationArea}>
					<AnimatedContainer config={animationConfig} />

					{/* Action buttons */}
					<Flex className={styles.actionButtons} gap="2">
						{configId && (
							<Button className={styles.actionButton} onClick={handleShare}>
								<Share1Icon /> Share
							</Button>
						)}
						<Button className={styles.actionButton} onClick={handleExport}>
							<CodeIcon /> Export Code
						</Button>
					</Flex>
				</Box>

				{/* Right side - Config Panel */}
				<Box className={styles.configAreaWrapper}>
					<ConfigPanel
						initialConfig={animationConfig}
						onConfigChange={handleConfigChange}
						onSave={handleSave}
						onReset={handleReset}
					/>
				</Box>
			</Flex>

			{/* Share Dialog */}
			<Dialog.Root open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
				<Dialog.Content>
					<Dialog.Title>Share Animation Configuration</Dialog.Title>
					<Dialog.Description>
						Anyone with this link can view and edit this animation
						configuration.
					</Dialog.Description>

					<Flex gap="3" mt="4">
						<TextField.Root value={shareUrl} readOnly style={{ flexGrow: 1 }} />
						<IconButton onClick={handleCopyUrl}>
							<CopyIcon />
						</IconButton>
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

			{/* Export Dialog */}
			<Dialog.Root open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
				<Dialog.Content>
					<Dialog.Title>Export Animation Code</Dialog.Title>
					<Dialog.Description>
						Copy the generated code to use this animation in your project.
					</Dialog.Description>

					<Tabs.Root
						defaultValue="react"
						value={exportTab}
						onValueChange={setExportTab}
					>
						<Tabs.List>
							<Tabs.Trigger value="react">React Component</Tabs.Trigger>
							<Tabs.Trigger value="css">CSS</Tabs.Trigger>
						</Tabs.List>

						<Box pt="3">
							<Tabs.Content value="react">
								<pre className={styles.codeBlock}>
									{generateReactComponent(animationConfig)}
								</pre>
							</Tabs.Content>

							<Tabs.Content value="css">
								<pre className={styles.codeBlock}>
									{generateCSSCode(animationConfig)}
								</pre>
							</Tabs.Content>
						</Box>
					</Tabs.Root>

					<Flex gap="3" mt="4" justify="end">
						<Button onClick={handleCopyCode}>
							<CopyIcon /> Copy Code
						</Button>
						<Dialog.Close>
							<Button variant="soft">Close</Button>
						</Dialog.Close>
					</Flex>

					{copySuccess && (
						<Text color="green" mt="2">
							Code copied to clipboard!
						</Text>
					)}
				</Dialog.Content>
			</Dialog.Root>
		</div>
	);
}
