// src/components/header/Header.tsx
'use client';

import React from 'react';

import { Flex, Link as RadixLink } from '@radix-ui/themes';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { UserAvatar } from '@/components/profile/UserAvatar';
import { ThemeToggle } from '@/components/theme-toggle';

import styles from './Header.module.scss';

export const Header = () => {
	const pathname = usePathname();

	return (
		<header className={`${styles.header} fade-in`}>
			<div className={styles.headerContent}>
				{/* Left Section: Logo & Links */}
				<Flex gap="6" align="center" className={styles.leftSection}>
					{/* Logo */}
					<Link href="/" className={styles.logoContainer}>
						<div className={styles.logo}>
							<Image
								src="/logo.png"
								alt="Animation Playground Logo"
								width={'36'}
								height={'36'}
							/>
						</div>
					</Link>

					{/* Navigation Links */}
					<nav className={styles.nav}>
						<Link href="/" passHref legacyBehavior>
							<RadixLink
								className={pathname === '/' ? styles.active : ''}
								weight={pathname === '/' ? 'bold' : 'regular'}
							>
								Playground
							</RadixLink>
						</Link>

						<Link href="/documentation" passHref legacyBehavior>
							<RadixLink
								className={pathname === '/documentation' ? styles.active : ''}
								weight={pathname === '/documentation' ? 'bold' : 'regular'}
							>
								Documentation
							</RadixLink>
						</Link>
					</nav>
				</Flex>

				<div className={styles.rightSection}>
					{/* Profile Button with Avatar */}
					<Link href="/profile" passHref>
						<div className={styles.profileButton}>
							<UserAvatar />
						</div>
					</Link>

					<ThemeToggle />
				</div>
			</div>
		</header>
	);
};
