// // app/(main)/profile/page.tsx
'use client';

import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import { SignOutButton } from '@/components/profile/SignOutButton';
import { createClient } from '@/utils/supabase/client';

import styles from './page.module.scss';

export default function ProfilePage() {
	const [userInfo, setUserInfo] = useState<{
		email: string | null;
		name: string | null;
		avatar_url?: string | null;
	}>({
		email: null,
		name: null,
		avatar_url: null,
	});
	const [loading, setLoading] = useState(true);
	const supabase = createClient();
	const router = useRouter();

	useEffect(() => {
		const getUser = async () => {
			const {
				data: { user },
				error,
			} = await supabase.auth.getUser();
			console.log('User:', user);

			if (error || !user) {
				router.push('/register');
				return;
			}

			// Get user info including name from user metadata
			const name =
				user.user_metadata?.full_name || user.user_metadata?.name || 'User';
			const avatar = user.user_metadata?.avatar_url;

			setUserInfo({
				email: user.email || null,
				name: name,
				avatar_url: avatar,
			});
			setLoading(false);
		};

		getUser();
	}, []);

	if (loading) {
		return <div className={styles.loadingContainer}>Loading...</div>;
	}

	return (
		<div className={styles.profileContainer}>
			<h1>Profile</h1>
			<div className={styles.userInfo}>
				<p>
					<strong>Name:</strong> {userInfo.name}
				</p>
				<p>
					<strong>Email:</strong> {userInfo.email}
				</p>
			</div>
			<SignOutButton />
		</div>
	);
}
