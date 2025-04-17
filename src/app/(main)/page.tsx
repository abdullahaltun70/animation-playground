'use client';

import React from 'react';

import PlaygroundPage from '@/app/(main)/playground/page';

import styles from './page.module.scss';

export default function Home() {
	return (
		<div className={styles.main}>
			<main>
				<PlaygroundPage />
			</main>
		</div>
	);
}
