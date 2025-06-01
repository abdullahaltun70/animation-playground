import { NextRequest, NextResponse } from 'next/server';

import {
  getAllConfigsAction,
  saveConfigAction,
} from '@/app/utils/actions/supabase/configs';
import { authenticateUser } from '@/app/utils/supabase/authenticateUser';

/**
 * GET /api/configs
 * Retrieves all public configurations.
 * If the user is authenticated, their own configurations are excluded.
 * @returns NextResponse with all configurations or an error message.
 */
export async function GET(request: NextRequest) {
  // Added request parameter
  try {
    const authResult = await authenticateUser(request); // Attempt to authenticate
    const authenticatedUserId = authResult.user?.id; // Get user ID if authenticated

    const result = await getAllConfigsAction(authenticatedUserId); // Pass user ID to action

    if (result.success) {
      return NextResponse.json(result.data || []);
    } else {
      return NextResponse.json(
        { error: result.message || 'Failed to fetch configurations' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('[API GET /api/configs] Error:', error);
    return NextResponse.json(
      {
        error: `Failed to fetch configurations: ${error instanceof Error ? error.message : 'Unknown error'}`,
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/configs
 * Creates a new configuration for the authenticated user.
 * @param request - The NextRequest object containing the request body.
 * @returns NextResponse with the created configuration or an error message.
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateUser(request);

    if (authResult.error || !authResult.user) {
      console.error(
        'Authentication failed in POST /api/configs route:',
        authResult.error
      );
      return (
        authResult.error ||
        NextResponse.json(
          { error: 'User authentication failed.' },
          { status: 401 }
        )
      );
    }

    const userId = authResult.user.id;
    const authorName =
      authResult.user.user_metadata?.full_name ||
      authResult.user.email ||
      'Anonymous';

    const body = await request.json();

    if (!body.title || !body.configData) {
      return NextResponse.json(
        { error: 'Title and configuration data are required' },
        { status: 400 }
      );
    }
    const isPublic = typeof body.isPublic === 'boolean' ? body.isPublic : false;

    const result = await saveConfigAction(
      body.title,
      body.description || null,
      body.configData,
      isPublic,
      userId,
      authorName
    );

    if (result.success && result.data && result.data.length > 0) {
      return NextResponse.json(result.data[0], { status: 201 });
    } else {
      return NextResponse.json(
        { error: result.message || `Failed to save configuration.` },
        {
          status:
            result.message?.includes('cannot exceed') ||
            result.message?.includes('enter a config title')
              ? 400
              : 500,
        }
      );
    }
  } catch (error: unknown) {
    console.error(
      'Error creating configuration in POST /api/configs route:',
      error
    );
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid JSON payload' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      {
        error: `Failed to create configuration: ${error instanceof Error ? error.message : 'An internal server error occurred'}`,
      },
      { status: 500 }
    );
  }
}
