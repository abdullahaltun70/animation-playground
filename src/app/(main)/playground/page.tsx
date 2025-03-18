import React from 'react';
import { AnimatedContainer } from '@/components/animated-container';
import { ConfigPanel } from '@/components/config-panel/ConfigPanel';
import styles from './page.module.scss';
import { Box, Button, Flex } from '@radix-ui/themes';

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
