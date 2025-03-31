// utils/actions/supabase/users.ts
import { createClient } from '@/utils/supabase/client';

export async function getUserData() {
	const supabase = createClient();
	const {
		data: { user },
		error,
	} = await supabase.auth.getUser();

	if (error || !user) {
		console.error('Error fetching user:', error);
		return null;
	}

	const name =
		user.user_metadata?.full_name || user.user_metadata?.name || 'User';
	const avatarUrl = user.user_metadata?.avatar_url as string;

	const email = user.email || '';

	return {
		id: user.id,
		email: email,
		name: name,
		avatar_url: avatarUrl,
	};
}
