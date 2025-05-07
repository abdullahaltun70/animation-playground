import { NextRequest, NextResponse } from 'next/server';

import {
  getAllConfigsAction,
  saveConfigAction,
} from '@/app/utils/actions/supabase/configs';
import { authenticateUser } from '@/app/utils/supabase/authenticateUser';

// GET /api/configs - Get all configurations for the current
export async function GET() {
  try {
    const allConfigs = (await getAllConfigsAction()).data;

    return NextResponse.json(allConfigs);
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to fetch configurations: ${error}` },
      { status: 500 }
    );
  }
}

// POST /api/configs - Create a new configuration
export async function POST(request: NextRequest) {
  try {
    // Authenticate the user
    const authResult = await authenticateUser(request);

    // If authentication failed, return the error response
    if (authResult.error) {
      return authResult.error;
    }

    const userId = authResult.user.id;
    const body = await request.json();

    // Validate title and configData before inserting
    if (!body.title || !body.configData) {
      return NextResponse.json(
        { error: 'Title and configuration data are required' },
        { status: 400 }
      );
    }

    const isPublic = typeof body.isPublic === 'boolean' ? body.isPublic : false;

    // Call the server action
    const result = await saveConfigAction(
      body.title,
      body.description || null,
      body.configData,
      isPublic,
      userId
    );

    // Handle the server action's response
    if (result.success && result.data && result.data.length > 0) {
      // Return the first created config from the data array
      return NextResponse.json(result.data[0], { status: 201 });
    } else {
      // Return the error message from the server action
      const status =
        result.message?.includes('cannot exceed') ||
        result.message?.includes('enter a config title')
          ? 400
          : 500;
      return NextResponse.json(
        { error: result.message || 'Failed to save configuration' },
        { status }
      );
    }
  } catch (error) {
    console.error('Error creating configuration:', error);

    // Handle JSON parsing errors or other unexpected errors
    const message =
      error instanceof Error
        ? error.message
        : 'An internal server error occurred';

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid JSON payload' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: `Failed to create configuration: ${message}` },
      { status: 500 }
    );
  }
}
