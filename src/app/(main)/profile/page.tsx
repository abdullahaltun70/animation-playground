// app/(main)/profile/page.tsx
import { redirect } from 'next/navigation';

import { getConfigsByUserId } from '@/db/queries/read';
import type { Config } from '@/db/schema';
import { createClient } from '@/utils/supabase/server';

import ProfileClientPage from './ProfileClientPage';

interface UserInfo {
	id: string;
	email: string;
	name: string;
	avatar_url?: string;
}

export default async function ProfilePageServer() {
	// Omdat createClient nu asynchroon is, moeten we het awaiten
	const supabase = await createClient();

	const {
		data: { user },
		error,
	} = await supabase.auth.getUser();

	if (error || !user) {
		redirect('/login');
	}

	try {
		const userInfo: UserInfo = {
			id: user.id,
			email: user.email ?? '',
			name: user.user_metadata?.name || 'N/A',
			avatar_url: user.user_metadata?.avatar_url,
		};

		let initialConfigs: Config[] = [];
		let initialError: string | null = null;

		try {
			// We moeten supabase hier doorgeven, wat nu een awaited supabase client is
			// const configs = await getConfigsByUserId(user.id);
			// initialConfigs = configs || [];
			initialConfigs = await getConfigsByUserId(user.id);
		} catch (error) {
			console.error('Error fetching initial configs:', error);
			initialError =
				error instanceof Error
					? error.message
					: 'Failed to load initial configs';
		}

		return (
			<ProfileClientPage
				userInfo={userInfo}
				initialConfigs={initialConfigs}
				initialError={initialError}
			/>
		);
	} catch (error) {
		console.error('Unexpected error in ProfilePageServer:', error);
		redirect('/login');
	}
}
