import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Handles POST requests to /api/auth/postman/login for user authentication.
 * This endpoint is specifically designed for Postman or similar API testing tools,
 * allowing users to sign in and receive session tokens directly in the response body.
 *
 * @param {NextRequest} request - The incoming Next.js request object.
 * @returns {Promise<NextResponse>} A promise that resolves to a Next.js response object.
 *                                  On success, returns user and session data (including tokens).
 *                                  On failure, returns an error message with an appropriate status code.
 */
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
      { status: 500 }
    );
  }
}
