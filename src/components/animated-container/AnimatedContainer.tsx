import React from 'react';

import { Heading, Text } from '@radix-ui/themes';

import styles from './animated-container.module.scss';

interface AnimatedContainerProps {
	children?: React.ReactNode;
}

export const AnimatedContainer: React.FC<AnimatedContainerProps> = ({
	children,
}) => {
	return (
		<>
			<Heading className={styles.title}>Animation box</Heading>
			<div className={styles.container}>
				<div className={styles.animationBox}>
					{children || (
						<div className={styles.animatableElement}>
							<Text>Animate Me!</Text>
						</div>
					)}
				</div>
			</div>
		</>
	);
};
