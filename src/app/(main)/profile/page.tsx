// // app/(main)/profile/page.tsx
'use client';

import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import { SignOutButton } from '@/components/profile/SignOutButton';
import { createClient } from '@/utils/supabase/client';

import styles from './page.module.scss';

export default function ProfilePage() {
	const [userInfo, setUserInfo] = useState<
		| {
				id: string;
				email: string;
				name: string;
				avatar_url?: string;
		  }
		| undefined
	>();

	const [userData, setUserData] = useState(Object);

	const [configTitle, setConfigTitle] = useState('');
	const [configDesc, setConfigDesc] = useState('');
	const [message, setMessage] = useState('');

	const [loading, setLoading] = useState(true);
	const supabase = createClient();
	const router = useRouter();

	useEffect(() => {
		const getUser = async () => {
			const {
				data: { user },
				error,
			} = await supabase.auth.getUser();

			setUserData(user);
			console.log('User:', user);
			console.log('User id:', user?.id);
			// I want the type of id
			console.log('type of id:', typeof user?.id);

			if (error || !user) {
				router.push('/register');
				return;
			}

			// Get user info including name from user metadata
			const name =
				user.user_metadata?.full_name || user.user_metadata?.name || 'User';
			const avatar = user.user_metadata?.avatar_url;

			// Get the user's database ID by checking the users_table
			const userId = user.id;
			console.log('User ID:', userId);

			// if (userError) {
			// 	console.error('Error fetching user ID:', userError);
			// }
			console.log('User data:', user);

			setUserInfo({
				id: user?.id,
				email: user.email!,
				name: name,
				avatar_url: avatar,
			});
			setLoading(false);
		};

		getUser();
	}, []);

	const handleSaveConfig = async () => {
		if (!userData.id) {
			setMessage(
				'User ID not found. Please make sure your account is properly set up.',
			);
			return;
		}

		if (!configTitle.trim()) {
			setMessage('Please enter a config title');
			return;
		}

		try {
			const { data, error } = await supabase
				.from('configs_table')
				.insert([{ title: configTitle, description: configDesc }])
				.select();

			if (error) throw error;

			setMessage('Config saved successfully!');
			setConfigTitle('');
			setConfigDesc('');
		} catch (error) {
			console.error('Error saving config:', error);
			setMessage('Error saving config. Please try again.');
		}
	};

	if (loading) {
		return <div className={styles.loadingContainer}>Loading...</div>;
	}

	return (
		<div className={styles.profileContainer}>
			<h1>Profile</h1>
			<div className={styles.userInfo}>
				<p>
					<strong>Name:</strong> {userInfo?.name}
				</p>
				<p>
					<strong>Email:</strong> {userInfo?.email}
				</p>
				<p>
					<strong>UUID:</strong> {userInfo?.id}
				</p>
			</div>

			<div className={styles.configForm}>
				<h2>Create New Config</h2>
				{message && (
					<p
						className={
							message.includes('Error') ? styles.error : styles.success
						}
					>
						{message}
					</p>
				)}

				<div className={styles.formGroup}>
					<label htmlFor="configTitle">Config Title:</label>
					<input
						type="text"
						id="configTitle"
						value={configTitle}
						onChange={(e) => setConfigTitle(e.target.value)}
					/>
				</div>

				<div className={styles.formGroup}>
					<label htmlFor="configDesc">Description:</label>
					<textarea
						id="configDesc"
						value={configDesc}
						onChange={(e) => setConfigDesc(e.target.value)}
					></textarea>
				</div>

				<button onClick={handleSaveConfig}>Save Config</button>
			</div>

			<SignOutButton />
		</div>
	);
}
