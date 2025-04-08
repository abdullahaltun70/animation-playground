'use client';

import React, { useEffect, useRef, useState } from 'react';

import { ResetIcon } from '@radix-ui/react-icons';
import { Button, Heading, Text } from '@radix-ui/themes';

import { AnimationConfig } from '@/types/animations';

import styles from './AnimatedContainer.module.scss';

interface AnimatedContainerProps {
	children?: React.ReactNode;
	config?: AnimationConfig;
}

export const AnimatedContainer: React.FC<AnimatedContainerProps> = ({
	children,
	config = {
		type: 'fade',
		duration: 0.5,
		delay: 0,
		easing: 'ease-out',
		opacity: {
			start: 0,
			end: 1,
		},
	},
}) => {
	const [key, setKey] = useState(0);
	const elementRef = useRef<HTMLDivElement>(null);

	// Function to apply animation classes based on config
	const getAnimationClasses = (): string => {
		const baseClass = styles.animatableElement;

		// Map animation type to the corresponding library class
		switch (config.type) {
			case 'fade':
				return `${baseClass} fade-in`;
			case 'slide':
				return `${baseClass} ${config.distance && config.distance < 0 ? 'slide-in-left' : 'slide-in-right'}`;
			case 'scale':
				return `${baseClass} scale-in`;
			case 'rotate':
				return `${baseClass} rotate-in`;
			case 'bounce':
				return `${baseClass} bounce-in`;
			default:
				return baseClass;
		}
	};

	// Apply CSS custom properties and force re-render when config changes
	useEffect(() => {
		if (elementRef.current) {
			// Convert duration, delay and other parameters to CSS custom properties
			// Duration for all animation types
			elementRef.current.style.setProperty(
				'--fade-duration',
				`${config.duration}s`,
			);
			elementRef.current.style.setProperty(
				'--slide-duration',
				`${config.duration}s`,
			);
			elementRef.current.style.setProperty(
				'--scale-duration',
				`${config.duration}s`,
			);
			elementRef.current.style.setProperty(
				'--rotate-duration',
				`${config.duration}s`,
			);
			elementRef.current.style.setProperty(
				'--bounce-duration',
				`${config.duration}s`,
			);

			// Delay for all animation types
			elementRef.current.style.setProperty('--fade-delay', `${config.delay}s`);
			elementRef.current.style.setProperty('--slide-delay', `${config.delay}s`);
			elementRef.current.style.setProperty('--scale-delay', `${config.delay}s`);
			elementRef.current.style.setProperty(
				'--rotate-delay',
				`${config.delay}s`,
			);
			elementRef.current.style.setProperty(
				'--bounce-delay',
				`${config.delay}s`,
			);

			// Easing for all animation types
			elementRef.current.style.setProperty('--fade-easing', config.easing);
			elementRef.current.style.setProperty('--slide-easing', config.easing);
			elementRef.current.style.setProperty('--scale-easing', config.easing);
			elementRef.current.style.setProperty('--rotate-easing', config.easing);
			elementRef.current.style.setProperty('--bounce-easing', config.easing);

			// Type-specific variables
			if (config.type === 'fade' && config.opacity) {
				elementRef.current.style.setProperty(
					'--fade-opacity-start',
					config.opacity.start.toString(),
				);
				elementRef.current.style.setProperty(
					'--fade-opacity-end',
					config.opacity.end.toString(),
				);
			}

			if (config.type === 'slide' && config.distance !== undefined) {
				elementRef.current.style.setProperty(
					'--slide-distance',
					`${Math.abs(config.distance)}px`,
				);
			}

			if (config.type === 'scale' && config.scale !== undefined) {
				elementRef.current.style.setProperty(
					'--scale-from',
					config.scale.toString(),
				);
			}

			if (config.type === 'rotate' && config.degrees !== undefined) {
				elementRef.current.style.setProperty(
					'--rotate-degrees',
					`${config.degrees}deg`,
				);
			}

			if (config.type === 'bounce' && config.distance !== undefined) {
				elementRef.current.style.setProperty(
					'--bounce-height',
					`${config.distance}px`,
				);
			}
		}
	}, [config, key]);

	// Function to replay the animation
	const handleReplay = () => {
		setKey((prevKey) => prevKey + 1);
	};

	// Force re-render to restart animation when config changes
	useEffect(() => {
		handleReplay();
	}, [
		config.type,
		config.duration,
		config.delay,
		config.easing,
		config.opacity, // Fade specifiek, maar veilig om altijd mee te nemen
		config.distance, // Slide & Bounce specifiek
		config.scale, // Scale specifiek
		config.degrees, // Rotate specifiek
	]);

	return (
		<>
			<Heading className={styles.title}>Animation Preview</Heading>
			<div className={styles.container}>
				<div className={styles.animationBox}>
					{children || (
						<div key={key} ref={elementRef} className={getAnimationClasses()}>
							<Text>Animate Me!</Text>
						</div>
					)}
				</div>
				<Button className={styles.replayButton} onClick={handleReplay}>
					<ResetIcon /> Replay Animation
				</Button>
			</div>
		</>
	);
};
