import React from 'react';

import { Box, Flex } from '@radix-ui/themes';

import { AnimatedContainer } from '@/components/animated-container';
import { ConfigPanel } from '@/components/config-panel/ConfigPanel';

import styles from './page.module.scss';

export default function PlaygroundPage() {
	return (
		<Flex className={styles.container}>
			{/* Left side - Animation Preview Area */}
			<Box className={styles.animationArea}>
				<AnimatedContainer />
			</Box>

			{/* Right side - Config Panel */}
			<Box className={styles.configAreaWrapper}>
				<ConfigPanel />
			</Box>
		</Flex>
	);
}
