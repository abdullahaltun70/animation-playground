// app/(main)/layout.tsx

import React from 'react';

import { Footer } from '@/components/footer/Footer';
import { Header } from '@/components/header';

import styles from './playground/page.module.scss';

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
			<main className={styles.main}>{children}</main>
			<footer>
				<Footer />
			</footer>
		</>
	);
}
