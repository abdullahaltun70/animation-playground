'use client';

import React, { Suspense } from 'react';

import { Skeleton } from '@radix-ui/themes';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';

import { createClient } from '@/utils/supabase/client';

function Page() {
	const supabase = createClient();

	return (
		<>
			<Suspense fallback={<Skeleton loading={true} />}>
				<Auth
					supabaseClient={supabase}
					appearance={{ theme: ThemeSupa }}
					providers={['google']}
					redirectTo={`${window.location.origin}/profile`}
				/>
			</Suspense>
		</>
	);
}

export default Page;
