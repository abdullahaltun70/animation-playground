'use client';

import React, { useState, useEffect } from 'react';

import {
	Button,
	Heading,
	Select,
	Slider,
	Theme,
	Text,
	TextField,
} from '@radix-ui/themes';

import {
	AnimationConfig,
	AnimationType,
	EasingFunction,
} from '@/types/animations';

import styles from './ConfigPanel.module.scss';

interface ConfigPanelProps {
	initialConfig?: AnimationConfig;
	onConfigChange?: (config: AnimationConfig) => void;
	onSave?: (config: AnimationConfig) => void;
	onReset?: () => void;
}

export function ConfigPanel({
	initialConfig,
	onConfigChange,
	onSave,
	onReset,
}: ConfigPanelProps) {
	const [config, setConfig] = useState<AnimationConfig>(
		initialConfig || {
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
		},
	);

	// Update local state when initialConfig changes
	useEffect(() => {
		if (initialConfig) {
			setConfig(initialConfig);
		}
	}, [initialConfig]);

	const handleChange = (
		key: string,
		value: string | number | AnimationType | EasingFunction,
	) => {
		const newConfig = {
			...config,
			[key]: value,
		};

		setConfig(newConfig);

		// Alleen namen en beschrijvingen gebufferd updaten
		if (key === 'name' || key === 'description') {
		} else if (onConfigChange) {
			// Direct updaten voor alle andere wijzigingen die de animatie beïnvloeden
			onConfigChange(newConfig);
		}
	};

	const handleOpacityChange = (key: 'start' | 'end', value: number) => {
		setConfig((prev) => ({
			...prev,
			opacity: {
				...(prev.opacity || { start: 0, end: 1 }),
				[key]: value / 100,
			},
		}));
	};

	const handleReset = () => {
		setConfig({
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
		if (onReset) onReset();
	};

	const handleSave = () => {
		if (onConfigChange) onConfigChange(config); // Update parent met laatste wijzigingen
		if (onSave) onSave(config);
	};

	return (
		<div className={styles.configPanel}>
			<h2 className={styles.title}>Animation Configuration</h2>

			{/* Configuration Name and Description */}
			<div className={styles.field}>
				<Text weight="bold">Configuration Name</Text>
				<TextField.Root
					placeholder="My Animation"
					value={config.name || ''}
					onChange={(e) => handleChange('name', e.target.value)}
				/>
			</div>

			<div className={styles.field}>
				<Text weight="bold">Description</Text>
				<TextField.Root
					placeholder="Describe your animation"
					value={config.description || ''}
					onChange={(e) => handleChange('description', e.target.value)}
				/>
			</div>

			{/* Animation Type Selection */}
			<div className={styles.field}>
				<Text weight="bold">Animation Type</Text>
				<Select.Root
					value={config.type}
					onValueChange={(value) =>
						handleChange('type', value as AnimationType)
					}
				>
					<Select.Trigger />
					<Select.Content>
						<Select.Item value="fade">Fade</Select.Item>
						<Select.Item value="slide">Slide</Select.Item>
						<Select.Item value="scale">Scale</Select.Item>
						<Select.Item value="rotate">Rotate</Select.Item>
						<Select.Item value="bounce">Bounce</Select.Item>
					</Select.Content>
				</Select.Root>
			</div>

			{/* Easing Function Selection */}
			<div className={styles.field}>
				<Text weight="bold">Easing Function</Text>
				<Select.Root
					value={config.easing}
					onValueChange={(value) =>
						handleChange('easing', value as EasingFunction)
					}
				>
					<Select.Trigger />
					<Select.Content>
						<Select.Item value="ease">Ease</Select.Item>
						<Select.Item value="ease-in">Ease In</Select.Item>
						<Select.Item value="ease-out">Ease Out</Select.Item>
						<Select.Item value="ease-in-out">Ease In Out</Select.Item>
						<Select.Item value="linear">Linear</Select.Item>
						<Select.Item value="cubic-bezier(0.175, 0.885, 0.32, 1.275)">
							Elastic
						</Select.Item>
					</Select.Content>
				</Select.Root>
			</div>

			<Heading size={'3'}>Animation Parameters</Heading>
			<Theme>
				<div className={styles.field}>
					<label>Duration (seconds)</label>
					<Slider
						value={[config.duration * 10]}
						min={1}
						max={30}
						step={1}
						onValueChange={(value) => handleChange('duration', value[0] / 10)}
					/>
					<Text size="1">{config.duration.toFixed(1)}s</Text>
				</div>

				<div className={styles.field}>
					<label>Delay (seconds)</label>
					<Slider
						value={[config.delay * 10]}
						min={0}
						max={20}
						step={1}
						onValueChange={(value) => handleChange('delay', value[0] / 10)}
					/>
					<Text size="1">{config.delay.toFixed(1)}s</Text>
				</div>

				{/* Type-specific parameters */}
				{config.type === 'fade' && (
					<>
						<div className={styles.field}>
							<label>Start Opacity</label>
							<Slider
								value={[config.opacity ? config.opacity.start * 100 : 0]}
								min={0}
								max={100}
								step={1}
								onValueChange={(value) =>
									handleOpacityChange('start', value[0])
								}
							/>
							<Text size="1">
								{config.opacity ? (config.opacity.start * 100).toFixed(0) : 0}%
							</Text>
						</div>
						<div className={styles.field}>
							<label>End Opacity</label>
							<Slider
								value={[config.opacity ? config.opacity.end * 100 : 100]}
								min={0}
								max={100}
								step={1}
								onValueChange={(value) => handleOpacityChange('end', value[0])}
							/>
							<Text size="1">
								{config.opacity ? (config.opacity.end * 100).toFixed(0) : 100}%
							</Text>
						</div>
					</>
				)}

				{(config.type === 'slide' || config.type === 'bounce') && (
					<div className={styles.field}>
						<label>Distance (pixels)</label>
						<Slider
							value={[config.distance || 50]}
							min={-200}
							max={200}
							step={1}
							onValueChange={(value) => handleChange('distance', value[0])}
						/>
						<Text size="1">{config.distance || 50}px</Text>
					</div>
				)}

				{config.type === 'scale' && (
					<div className={styles.field}>
						<label>Scale Factor</label>
						<Slider
							value={[config.scale ? config.scale * 100 : 80]}
							min={10}
							max={200}
							step={1}
							onValueChange={(value) => handleChange('scale', value[0] / 100)}
						/>
						<Text size="1">
							{config.scale ? (config.scale * 100).toFixed(0) : 80}%
						</Text>
					</div>
				)}

				{config.type === 'rotate' && (
					<div className={styles.field}>
						<label>Rotation (degrees)</label>
						<Slider
							value={[config.degrees || 360]}
							min={-360}
							max={360}
							step={1}
							onValueChange={(value) => handleChange('degrees', value[0])}
						/>
						<Text size="1">{config.degrees || 360}°</Text>
					</div>
				)}
			</Theme>

			{/* Buttons */}
			<div className={styles.configButtons}>
				<Button className={styles.button} onClick={handleReset}>
					Reset
				</Button>
				<Button className={styles.button} onClick={handleSave}>
					Save
				</Button>
			</div>
		</div>
	);
}
