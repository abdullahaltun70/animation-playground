import React, { useState } from 'react';
import {Heading, Text} from '@radix-ui/themes';
import styles from './AnimatedContainer.module.scss';

interface AnimatedContainerProps {
	children?: React.ReactNode;
}

export const AnimatedContainer: React.FC<AnimatedContainerProps> = ({
	children,
}) => {
	return (
		<div className={styles.container}>
			<Heading className={styles.title} >
				Animation box
			</Heading>

			<div className={styles.animationBox}>
				{children || (
					<div className={styles.animatableElement}>
						<Text>Animate Me!</Text>
					</div>
				)}
			</div>
		</div>
	);
};
