'use client';

import React from 'react';

import { PersonIcon } from '@radix-ui/react-icons';
import { Flex, Link as RadixLink } from '@radix-ui/themes';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

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
								alt="Radix UI Logo"
								width={'36'}
								height={'36'}
							/>
							{/*<svg*/}
							{/*	width="24"*/}
							{/*	height="24"*/}
							{/*	viewBox="0 0 24 24"*/}
							{/*	fill="white"*/}
							{/*	xmlns="http://www.w3.org/2000/svg"*/}
							{/*>*/}
							{/*	<path d="M12 2L2 12l10 10 10-10L12 2zm0 4l6 6-6 6-6-6 6-6z" />*/}
							{/*</svg>*/}
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
					{/* Profile Button */}
					<Link href="/profile" passHref legacyBehavior>
						<RadixLink className={styles.profileButton}>
							<PersonIcon width={24} height={24} />
						</RadixLink>
					</Link>

					{/*	<ThemeSwitcher />*/}
					<ThemeToggle />
				</div>
			</div>
		</header>
	);
};
