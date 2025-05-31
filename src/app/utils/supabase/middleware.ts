import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Do not run code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: DO NOT REMOVE auth.getUser()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  // Handle auth session missing error
  if (error && error.message?.includes('Auth session missing')) {
    console.log('No active session found in middleware');
    // Treat as no user, continue with middleware logic
  }

  // for api testing purposes
  const authHeader = request.headers.get('Authorization');
  const hasBearerToken = authHeader?.startsWith('Bearer ');

  // Define public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/login',
    '/auth',
    '/api/auth',
    '/documentation',
    '/terms',
    '/privacy',
    '/api/health',
    '/playground', // Allow public access to playground
    '/acc-demo', // Accessibility demo
    '/error', // Error pages
    '/test', // Test pages
    '/server-component-test',
  ];

  // Define protected routes that explicitly require authentication
  const protectedRoutes = [
    '/profile',
    '/api/configs', // User-specific configuration APIs
  ];

  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  // Check if the current path is explicitly protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  // For root path, redirect to login if not authenticated
  const isRootPath = request.nextUrl.pathname === '/';

  if (
    !user && // No cookie-based user
    !hasBearerToken && // AND no Bearer token present
    (isProtectedRoute || isRootPath) && // AND is a protected route or root
    !isPublicRoute // AND not explicitly public
  ) {
    // no user, potentially respond by redirecting the user to the login page
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you're creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse;
}
