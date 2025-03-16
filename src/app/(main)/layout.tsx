// app/(main)/layout.tsx

import { Footer } from '@/components/footer/Footer';
import React from 'react';
import styles from './page.module.scss';
import { Header } from '@/components/header';

export default function MainLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className={styles.layout}>
			<Header />
			<main className={styles.main}>{children}</main>
			<Footer />
		</div>
	);
}
