'use client';

import React from 'react';

import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';

import { createClient } from '@/utils/supabase/client';

function Page() {
	const supabase = createClient();

	return (
		<>
			<Auth
				supabaseClient={supabase}
				appearance={{ theme: ThemeSupa }}
				providers={['google']}
				redirectTo={`${window.location.origin}/profile`}
			/>
		</>
	);
}

export default Page;
