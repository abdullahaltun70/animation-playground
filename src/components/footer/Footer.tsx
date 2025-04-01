// components/footer/Footer.tsx
import React from 'react';

import { Link as RadixLink, Text } from '@radix-ui/themes';
import Link from 'next/link';

import styles from './Footer.module.scss';

export const Footer = () => {
	const currentYear = new Date().getFullYear();

	return (
		<footer className={`${styles.footer} fade-in`}>
			<div className={styles.footerContent}>
				{/* Copyright */}
				<Text size="2">© {currentYear} Animation Playground</Text>

				{/* Links */}
				<div className={styles.footerLinks}>
					<Link
						href="/#"
						// TODO: make the terms page
						// href="/terms"
						passHref
						legacyBehavior
					>
						<RadixLink size="2">Terms</RadixLink>
					</Link>
					<Link
						href="/#"
						// TODO: make the privacy page
						// href="/privacy"
						passHref
						legacyBehavior
					>
						<RadixLink size="2">Privacy</RadixLink>
					</Link>
					<Link
						href="https://github.com/abdullahaltun70/animation-playground"
						passHref
						legacyBehavior
					>
						<RadixLink size="2" target="_blank" rel="noopener noreferrer">
							GitHub
						</RadixLink>
					</Link>
				</div>
			</div>
		</footer>
	);
};
