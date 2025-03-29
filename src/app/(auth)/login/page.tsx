'use client';

import React, { Suspense } from 'react';

import { Skeleton } from '@radix-ui/themes';

import AuthComponent from '@/app/(auth)/login/components/AuthComponent';

function Page() {
	return (
		<>
			<Suspense fallback={<Skeleton loading={true} />}>
				<AuthComponent />
			</Suspense>
		</>
	);
}

export default Page;
