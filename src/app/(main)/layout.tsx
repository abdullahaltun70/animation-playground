// app/(main)/layout.tsx

import React, { Suspense } from 'react';

import Loading from '@/app/(main)/playground/loading';
import { Footer } from '@/components/footer/Footer';
import { Header } from '@/components/header';

import styles from './playground/styles/Playground.module.scss';

export default function MainLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<>
			<header>
				<Header />
			</header>
			<Suspense fallback={<Loading />}>
				<main className={styles.main}>{children}</main>
			</Suspense>
			<footer>
				<Footer />
			</footer>
		</>
	);
}
