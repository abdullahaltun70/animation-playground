import React from 'react';

import { Box, Flex } from '@radix-ui/themes';

import styles from '@/app/(main)/playground/styles/Playground.module.scss';

const Loading = () => {
	return (
		<Flex className={styles.container}>
			{/* Left side - Animation Preview Area */}
			<Box className={styles.animationArea}>
				{/* Skeleton for AnimatedContainer */}
				<Box className={styles.skeleton} />

				{/* Action buttons */}
				<Flex className={styles.actionButtons} gap="2">
					<Box className={styles.skeletonButton} />
					<Box className={styles.skeletonButton} />
				</Flex>
			</Box>

			{/* Right side - Config Panel */}
			<Box className={styles.configAreaWrapper}>
				{/* Skeleton for ConfigPanel */}
				<Box className={styles.skeletonPanel} />
			</Box>
		</Flex>
	);
};

export default Loading;
