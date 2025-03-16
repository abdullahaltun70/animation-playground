import React, { useState } from 'react';
import { Heading } from '@radix-ui/themes';
import styles from './AnimatedContainer.module.scss';

interface AnimatedContainerProps {
	children?: React.ReactNode;
}

export const AnimatedContainer: React.FC<AnimatedContainerProps> = ({
	children,
}) => {
	return (
		<div className={styles.container}>
			<Heading className={styles.title} size="3">
				Animation box
			</Heading>

			<div className={styles.animationBox}>
				{children || (
					<div className={`${styles.animatableElement} ${styles.idle}`}>
						<span>Animate Me!</span>
					</div>
				)}
			</div>
		</div>
	);
};
