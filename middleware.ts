import { NextRequest } from 'next/server';

import { updateSession } from '@/utils/supabase/middleware';

export async function middleware(request: NextRequest) {
	return updateSession(request);
}

// Update the matcher to exclude the Postman auth endpoints
export const config = {
	matcher: [
		/*
		 * Match all request paths except:
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 * - public folder
		 * - public files
		 * - Postman auth endpoints
		 */
		'/((?!_next/static|_next/image|favicon.ico|public|api/auth/postman).*)',
	],
};
