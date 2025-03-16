'use client';

import React from 'react';
import { AnimatedContainer } from '@/components/animated-container';
import styles from './page.module.scss';
import { ConfigPanel } from '@/components/config-panel/ConfigPanel';
import PlaygroundPage from '@/app/(main)/playground/page';

export default function Home() {
	return (
		<div className={styles.main}>
			<main className={styles.content}>
				<PlaygroundPage />
			</main>
		</div>
	);
}
