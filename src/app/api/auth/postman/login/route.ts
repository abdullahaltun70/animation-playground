import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
	try {
		const { email, password } = await request.json();

		const cookieStore = cookies();
		const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

		const { data, error } = await supabase.auth.signInWithPassword({
			email,
			password,
		});

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 400 });
		}

		// Return the session data including tokens
		return NextResponse.json({
			user: data.user,
			session: {
				access_token: data.session?.access_token,
				refresh_token: data.session?.refresh_token,
				expires_at: data.session?.expires_at,
			},
		});
	} catch (error) {
		console.error('Authentication error:', error);
		return NextResponse.json(
			{ error: 'Invalid credentials or server error' },
			{ status: 500 },
		);
	}
}
