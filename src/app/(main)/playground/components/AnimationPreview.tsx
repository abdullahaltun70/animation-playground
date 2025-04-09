import React from 'react';

import { CodeIcon, Share1Icon } from '@radix-ui/react-icons';
import { Box, Button, Flex } from '@radix-ui/themes';

import { AnimatedContainer } from '@/components/animated-container/AnimatedContainer';
import { AnimationConfig } from '@/types/animations';

import styles from '../styles/Playground.module.scss';

interface AnimationPreviewProps {
	config: AnimationConfig;
	configId: string | null;
	onShare: () => void;
	onExport: () => void;
}

export function AnimationPreview({
	config,
	configId,
	onShare,
	onExport,
}: AnimationPreviewProps) {
	return (
		<Box className={styles.animationArea}>
			<AnimatedContainer config={config} />

			{/* Action buttons */}
			<AnimatedElementSlide>
				<AnimatedElementScale>
					<AnimatedElementBounce>
						<AnimatedElementFade>
							<Flex className={styles.actionButtons} gap="2">
								{configId && (
									<Button className={styles.actionButton} onClick={onShare}>
										<Share1Icon /> Share
									</Button>
								)}
								<Button className={styles.actionButton} onClick={onExport}>
									<CodeIcon /> Export Code
								</Button>
							</Flex>
						</AnimatedElementFade>
					</AnimatedElementBounce>
				</AnimatedElementScale>
			</AnimatedElementSlide>
		</Box>
	);
}

export const AnimatedElementSlide = ({
	children,
}: {
	children: React.ReactNode;
}) => {
	const style = {
		animation: 'slideInLeft 0.5s ease-out 0s forwards',
	};

	// Add this CSS to your stylesheet:
	// @keyframes slideInLeft {
	//   from { transform: translateX(-200px); }
	//   to { transform: translateX(0); }
	// }
	return <div style={style}>{children}</div>;
};

// Animation component generated from Scales In
export const AnimatedElementScale = ({
	children,
}: {
	children: React.ReactNode;
}) => {
	const style = {
		animation: 'scaleIn 0.3s linear 0s forwards',
	};

	// Add this CSS to your stylesheet:
	// @keyframes scaleIn {
	//   from { transform: scale(0.1); }
	//   to { transform: scale(1); }
	// }
	return <div style={style}>{children}</div>;
};

// Animation component generated from Bouncy 🦘
export const AnimatedElementBounce = ({
	children,
}: {
	children: React.ReactNode;
}) => {
	const style = {
		animation: 'bounceIn 0.8s ease 0s forwards',
	};

	// Add this CSS to your stylesheet:
	// @keyframes bounceIn {
	//   0% { transform: translateY(0); }
	//   50% { transform: translateY(-200px); }
	//   100% { transform: translateY(0); }
	// }
	return <div style={style}>{children}</div>;
};

// Animation component generated from Delayed Fade
export const AnimatedElementFade = ({
	children,
}: {
	children: React.ReactNode;
}) => {
	const style = {
		animation: 'fadeIn 3s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0s forwards',
	};

	// Add this CSS to your stylesheet:
	// @keyframes fadeIn {
	//   from { opacity: 0; }
	//   to { opacity: 1; }
	// }
	return <div style={style}>{children}</div>;
};
