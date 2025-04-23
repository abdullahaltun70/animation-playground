import { cache } from 'react';

import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/app/utils/supabase/server';

/**
 * Cached version of the createClient function to prevent multiple Supabase client instances
 */
export const getSupabaseClient = cache(async () => {
  return await createClient();
});

/**
 * Authenticates a user from either a Bearer token or cookies
 * Uses React's cache function to prevent duplicate authentication requests
 * within the same server component render cycle
 */
export const authenticateUser = cache(async (request: NextRequest) => {
  try {
    // Get the cached Supabase client
    const supabase = await getSupabaseClient();
    let user = null;

    // Check for Bearer token authentication (for API clients like Postman)
    const authHeader = request.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      // Extract the token
      const token = authHeader.substring(7);

      // Verify the token and get the user
      const {
        data: { user: tokenUser },
        error: tokenError,
      } = await supabase.auth.getUser(token);

      if (tokenError || !tokenUser) {
        return {
          error: NextResponse.json(
            { error: 'Invalid or expired token | Unauthorized' },
            { status: 401 }
          ),
        };
      }

      user = tokenUser;
    } else {
      // No Bearer token, try cookie-based authentication (for browser clients)
      const {
        data: { user: cookieUser },
        error: cookieError,
      } = await supabase.auth.getUser();

      if (cookieError || !cookieUser) {
        return {
          error: NextResponse.json(
            { error: 'Unauthorized - Please log in' },
            { status: 401 }
          ),
        };
      }

      user = cookieUser;
    }

    // Return the authenticated user
    return { user, supabase };
  } catch (error) {
    console.error('Authentication error:', error);
    return {
      error: NextResponse.json(
        { error: `Authentication failed: ${error}` },
        { status: 500 }
      ),
    };
  }
});
