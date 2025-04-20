import { NextRequest, NextResponse } from 'next/server';

import { getConfigsByUserId } from '@/db/queries/read';
import { authenticateUser } from '@/utils/supabase/authenticateUser';

export async function GET(request: NextRequest) {
  try {
    // Authenticate the user
    const authResult = await authenticateUser(request);

    // If authentication failed, return the error response
    if (authResult.error) {
      return authResult.error;
    }

    const { user } = authResult;
    const userId = user.id;

    // Fetch the user's configurations
    const configs = await getConfigsByUserId(userId);

    // Return the configurations and user info
    return NextResponse.json({
      configs,
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Error fetching configurations:', error);
    return NextResponse.json(
      { error: `Failed to fetch configurations: ${error}` },
      { status: 500 }
    );
  }
}
