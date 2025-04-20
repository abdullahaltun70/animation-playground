import { NextRequest, NextResponse } from 'next/server';

import { updateSession } from '@/utils/supabase/middleware';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === '/profile' || pathname.startsWith('/profile/')) {
    const response = await updateSession(request);

    if (!response.headers.has('location')) {
      // Find the Supabase auth cookie
      const supabaseCookieName = Object.keys(request.cookies.getAll()).find(
        (cookie) => cookie.includes('sb-') && cookie.includes('-auth-token')
      );

      if (!supabaseCookieName || !request.cookies.get(supabaseCookieName)) {
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        url.searchParams.set('redirectTo', pathname);
        return NextResponse.redirect(url);
      }
    }

    return response;
  }

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
