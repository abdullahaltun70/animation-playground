// app/(main)/layout.tsx

import React from 'react';

import { Footer } from '@/components/footer/Footer';
import { Header } from '@/components/header';

import styles from './playground/page.module.scss';

import '@/app/(main)/main.globals.scss';

export default function MainLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className={styles.layout}>
			<header>
				<Header />
			</header>
			<main className={styles.main}>{children}</main>
			<footer>
				<Footer />
			</footer>
		</div>
	);
}
