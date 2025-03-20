// // app/(main)/profile/page.tsx
// import { redirect } from 'next/navigation';
//
// import { createClient } from '@/utils/supabase/server';
//
// import styles from './page.module.scss';
//
// export default async function Profile() {
// 	const supabase = await createClient();
//
// 	const { data, error } = await supabase.auth.getUser();
// 	if (error || !data?.user) {
// 		redirect('/login');
// 	}
//
// 	return <p>Hello {data.user.email}</p>;
// }

// src/app/profile/page.tsx
'use client';

import { useEffect, useState } from 'react';

import { redirect } from 'next/navigation';

import { createClient } from '@/utils/supabase/client';

import styles from './page.module.scss';

export default function ProfilePage() {
	const [email, setEmail] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);
	const supabase = createClient();

	useEffect(() => {
		const getUser = async () => {
			const {
				data: { user },
				error,
			} = await supabase.auth.getUser();

			if (error || !user) {
				redirect('/login');
				return;
			}

			setEmail(user.email!);
			setLoading(false);
		};

		getUser();
	}, []);

	const handleSignOut = async () => {
		await supabase.auth.signOut();
		redirect('/');
	};

	if (loading) {
		return <div>Loading...</div>;
	}

	return (
		// <div className="max-w-md mx-auto mt-10 p-6 border rounded-md">
		// 	<h1 className="text-2xl font-bold mb-4">Profile</h1>
		// 	<p className="mb-6">Email: {email}</p>
		// 	<button
		// 		onClick={handleSignOut}
		// 		className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
		// 	>
		// 		Sign Out
		// 	</button>
		// </div>

		<div className={styles.profileContainer}>
			<h1>Profile</h1>
			<p>Email: {email}</p>
			<button onClick={handleSignOut}>Sign Out</button>
		</div>
	);
}
