'use client';

import React from 'react';

import PlaygroundPage from '@/app/(main)/playground/page';

import styles from './playground/styles/Playground.module.scss';

export default function Home() {
	return (
		<div className={styles.main}>
			<main className={styles.content}>
				<PlaygroundPage />
			</main>
		</div>
	);
}
