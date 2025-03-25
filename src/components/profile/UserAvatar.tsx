'use client';

import { useState, useEffect } from 'react';

import { PersonIcon } from '@radix-ui/react-icons';
import { Avatar } from '@radix-ui/themes';

import { createClient } from '@/utils/supabase/client';

import styles from './UserAvatar.module.scss';

export function UserAvatar() {
	const [initials, setInitials] = useState('');
	const [imageUrl, setImageUrl] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const supabase = createClient();

	useEffect(() => {
		const getUserData = async () => {
			try {
				const {
					data: { user },
				} = await supabase.auth.getUser();

				if (user) {
					setIsAuthenticated(true);

					if (user.user_metadata) {
						// Get name from Google metadata
						const fullName =
							user.user_metadata.name || user.user_metadata.full_name || '';

						// Get image from Google metadata
						const picture =
							user.user_metadata.picture || user.user_metadata.avatar_url;

						// Generate initials from full name
						const names = fullName.split(' ');
						let userInitials = '';

						if (names.length >= 2) {
							// First letter of first name + First letter of last name
							userInitials =
								`${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
						} else if (names.length === 1 && names[0]) {
							// Just first letter if only one name
							userInitials = names[0][0].toUpperCase();
						}

						setInitials(userInitials);
						setImageUrl(picture);
					}
				} else {
					setIsAuthenticated(false);
					setInitials('');
					setImageUrl(null);
				}
			} catch (error) {
				console.error('Error fetching user data:', error);
				setIsAuthenticated(false);
			} finally {
				setIsLoading(false);
			}
		};

		getUserData();

		// Subscribe to auth state changes
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((event, session) => {
			if (event === 'SIGNED_OUT') {
				setIsAuthenticated(false);
				setInitials('');
				setImageUrl(null);
			} else if (event === 'SIGNED_IN' && session?.user) {
				getUserData();
			}
		});

		return () => {
			subscription.unsubscribe();
		};
	}, []);

	if (isLoading) {
		return <Avatar size="2" radius="full" fallback="" />;
	}

	if (!isAuthenticated) {
		return (
			<Avatar
				size="2"
				radius="full"
				className={styles.userAvatar}
				fallback={<PersonIcon width="16" height="16" />}
			/>
		);
	}

	return (
		<Avatar
			size="2"
			radius="full"
			src={imageUrl || undefined}
			fallback={initials}
			className={styles.userAvatar}
		/>
	);
}
