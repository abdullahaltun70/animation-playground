'use client';
import React from 'react';

// Import your library's styles (adjust the path as needed)
// import 'animation-library-test-abdullah-altun/styles/globals.css';
import { Box, Flex } from '@radix-ui/themes';

import { AnimatedContainer } from '@/components/animated-container';
import AnimationTest from '@/components/AnimationTest';
import { ConfigPanel } from '@/components/config-panel';

import styles from './page.module.scss';

const Playground: React.FC = () => {
	return (
		<>
			<Flex className={styles.container}>
				{/* Left side - Animation Preview Area */}
				<Box className={styles.animationArea}>
					<AnimatedContainer />
				</Box>

				{/*<AnimationTest />*/}

				{/* Right side - Config Panel */}
				<Box className={styles.configAreaWrapper}>
					<ConfigPanel />
				</Box>
			</Flex>
		</>
	);
};

export default Playground;
