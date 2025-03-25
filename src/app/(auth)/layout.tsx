// src/app/(auth)/layout.tsx
import { ReactNode } from 'react';

import Link from 'next/link';

import styles from './auth.module.scss';

export default function AuthLayout({ children }: { children: ReactNode }) {
	return (
		<div className={styles.authContainer}>
			{/*<div className={styles.authCard}>*/}
			{/*	<div className={styles.authHeader}>*/}
			{/*		<Link href="/" className={styles.logo}>*/}
			{/*			<h2>Animation Playground ✨</h2>*/}
			{/*		</Link>*/}
			{/*	</div>*/}

			<div className={styles.authContent}>{children}</div>

			{/*	<div className={styles.authFooter}>*/}
			{/*		<p>© {new Date().getFullYear()} Framna</p>*/}
			{/*	</div>*/}
			{/*</div>*/}
		</div>
	);
}
