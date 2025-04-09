import { useState, useEffect, useCallback } from 'react';

import { useRouter, useSearchParams } from 'next/navigation';

import { AnimationConfig } from '@/types/animations';
import { createClient } from '@/utils/supabase/client';

// Default animation configuration
export const DEFAULT_ANIMATION_CONFIG: AnimationConfig = {
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
};

export function useAnimationConfig() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const configId = searchParams.get('id');

	const [animationConfig, setAnimationConfig] = useState<AnimationConfig>(
		DEFAULT_ANIMATION_CONFIG,
	);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [configLoaded, setConfigLoaded] = useState(false);

	// Load configuration from URL if configId is present
	useEffect(() => {
		if (configId) {
			setLoading(true);
			setConfigLoaded(false);

			fetch(`/api/configs/${configId}`, {
				credentials: 'include',
			})
				.then((response) => {
					if (!response.ok) {
						throw new Error(
							'Failed to load configuration: ' + response.statusText,
						);
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

	const saveConfig = async (config: AnimationConfig) => {
		if (!config.name) {
			setError('Please provide a name for your configuration');
			return false;
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
				return false;
			}

			const method = configId ? 'PUT' : 'POST';
			const url = configId ? `/api/configs/${configId}` : '/api/configs';

			const response = await fetch(url, {
				method,
				headers: {
					'Content-Type': 'application/json',
				},
				credentials: 'include',
				body: JSON.stringify({
					title: config.name,
					description: config.description || '',
					configData: JSON.stringify(config),
				}),
			});

			if (!response.ok) {
				throw new Error(
					`Failed to ${configId ? 'update' : 'save'} configuration: ${response.statusText}`,
				);
			}

			const data = await response.json();

			// Redirect to the configuration with its ID in the URL if it's a new configuration
			if (!configId) {
				router.push(`/playground?id=${data.id}`);
			}

			return true;
		} catch (err: any) {
			console.error('Error saving configuration:', err);
			setError(err.message);
			return false;
		} finally {
			setLoading(false);
		}
	};

	const resetConfig = () => {
		setAnimationConfig(DEFAULT_ANIMATION_CONFIG);

		// Remove the id from URL if present
		if (configId) {
			router.push('/playground');
		}
	};

	return {
		animationConfig,
		setAnimationConfig: handleConfigChange,
		loading,
		error,
		setError,
		configLoaded,
		configId,
		saveConfig,
		resetConfig,
	};
}
