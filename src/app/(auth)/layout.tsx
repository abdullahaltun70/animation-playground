// src/app/(auth)/layout.tsx
import React, { ReactNode } from 'react';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import styles from './login.module.scss'; // Gebruik de layout specifieke styles

export default function AuthLayout({ children }: { children: ReactNode }) {
	return (
		<div className={styles.authContainer}>
			<div className={styles.authCard}>
				<header className={styles.authHeader}>
					<Link href={'/'} className={styles.logoLink}>
						<h1 className={styles.headerTitle}>
							<ArrowLeft size={20} /> Animation Playground ✨
						</h1>
					</Link>
				</header>

				<main className={styles.authContent}>{children}</main>

				<footer className={styles.authFooter}>
					© {new Date().getFullYear()} Framna
				</footer>
			</div>
		</div>
	);
}
