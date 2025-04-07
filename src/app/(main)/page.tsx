'use client';

import React, { Suspense } from 'react';

import PlaygroundPage from '@/app/(main)/playground/page';

import styles from './playground/page.module.scss';

export default function Home() {
	return (
		<div className={styles.main}>
			<main className={styles.content}>
				<Suspense fallback={'Loading...'}>
					<PlaygroundPage />
				</Suspense>
			</main>
		</div>
	);
}
