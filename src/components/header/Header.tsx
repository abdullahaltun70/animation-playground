// src/components/header/Header.tsx
'use client';

import React, { useEffect, useState } from 'react'; // Import useState, useEffect

import { ExitIcon, PersonIcon } from '@radix-ui/react-icons'; // Import ExitIcon
import {
	Button,
	DropdownMenu,
	Flex,
	Link as RadixLink,
	Text,
} from '@radix-ui/themes';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation'; // Import useRouter

import { UserAvatar } from '@/components/profile/UserAvatar';
import { ThemeToggle } from '@/components/theme-toggle';
import { createClient } from '@/utils/supabase/client'; // Import supabase client

import styles from './Header.module.scss';

export const Header = () => {
	const pathname = usePathname();
	const router = useRouter(); // Initialize router
	const supabase = createClient(); // Initialize supabase

	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [userEmail, setUserEmail] = useState<string | null>(null); // State for user email
	const [isLoadingAuth, setIsLoadingAuth] = useState(true); // Loading state for auth check

	useEffect(() => {
		const checkAuth = async () => {
			setIsLoadingAuth(true);
			const {
				data: { session },
			} = await supabase.auth.getSession();
			const user = session?.user;
			setIsAuthenticated(!!user);
			setUserEmail(user?.email || null);
			setIsLoadingAuth(false);
		};

		checkAuth();

		// Listen for auth state changes
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			const user = session?.user;
			setIsAuthenticated(!!user);
			setUserEmail(user?.email || null);
			setIsLoadingAuth(false); // Update loading state on change too
		});

		// Cleanup subscription on unmount
		return () => {
			subscription?.unsubscribe();
		};
	}, [supabase.auth]); // Add supabase.auth dependency

	const handleSignOut = async () => {
		await supabase.auth.signOut();
		setIsAuthenticated(false); // Update state immediately for UI responsiveness
		setUserEmail(null);
		router.push('/'); // Redirect to home page after sign out
		router.refresh(); // Force refresh to clear potentially cached server data
	};

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

				{/* Right Section: Auth/Theme */}
				<div className={styles.rightSection}>
					{/* Conditionally render based on loading and auth state */}
					{!isLoadingAuth && (
						<DropdownMenu.Root>
							<DropdownMenu.Trigger>
								<Button
									className={styles.avatarTriggerButton}
									aria-label="User menu"
								>
									<UserAvatar />
								</Button>
							</DropdownMenu.Trigger>

							<DropdownMenu.Content align="end">
								{isAuthenticated ? (
									<>
										{userEmail && (
											<DropdownMenu.Label>
												<Text size="2" color="gray">
													{userEmail}
												</Text>
											</DropdownMenu.Label>
										)}
										<Link href="/profile" passHref legacyBehavior>
											<DropdownMenu.Item asChild>
												<a>
													{' '}
													{/* Use 'a' tag inside for correct rendering */}
													<PersonIcon
														width="16"
														height="16"
														style={{ marginRight: '8px' }}
													/>
													Profile
												</a>
											</DropdownMenu.Item>
										</Link>
										<DropdownMenu.Separator />
										<DropdownMenu.Item color="red" onSelect={handleSignOut}>
											<ExitIcon
												width="16"
												height="16"
												style={{ marginRight: '8px' }}
											/>
											Sign Out
										</DropdownMenu.Item>
									</>
								) : (
									<Link href="/login" passHref legacyBehavior>
										<DropdownMenu.Item asChild>
											<a>
												{' '}
												{/* Use 'a' tag inside */}
												<ExitIcon
													width="16"
													height="16"
													style={{
														transform: 'scaleX(-1)',
														marginRight: '8px',
													}}
												/>{' '}
												{/* Reversed icon for Sign In */}
												Sign In
											</a>
										</DropdownMenu.Item>
									</Link>
								)}
							</DropdownMenu.Content>
						</DropdownMenu.Root>
					)}
					{isLoadingAuth && (
						<div className={styles.avatarTriggerButton}>
							{' '}
							{/* Placeholder with same dimensions */}
							<UserAvatar /> {/* Or a skeleton Avatar */}
						</div>
					)}

					<ThemeToggle />
				</div>
			</div>
		</header>
	);
};
