// src/components/profile/SignOutButton.tsx
'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

// import styles from '@/app/(main)/profile/page.module.scss';
import { createClient } from '@/utils/supabase/client';

import styles from './components.module.scss';

export function SignOutButton() {
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();

	const handleSignOut = async () => {
		setIsLoading(true);
		try {
			const supabase = createClient();
			await supabase.auth.signOut();
			router.push('/');
		} catch (error) {
			console.error('Error signing out:', error);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<button
			onClick={handleSignOut}
			disabled={isLoading}
			className={styles.signOutButton}
		>
			{isLoading ? 'Signing out...' : 'Sign Out'}
		</button>
	);
}
