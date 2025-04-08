import React from 'react';

import { Share1Icon, CodeIcon } from '@radix-ui/react-icons';
import { Box, Flex, Button } from '@radix-ui/themes';

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
		</Box>
	);
}
