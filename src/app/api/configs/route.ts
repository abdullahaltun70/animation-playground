import { NextRequest, NextResponse } from 'next/server';

import { createConfig } from '@/db/queries/create';
import { getAllConfigs } from '@/db/queries/read';
import { authenticateUser } from '@/utils/supabase/authenticateUser';

// GET /api/configs - Get all configurations for the current user
export async function GET() {
  try {
    const allConfigs = await getAllConfigs();

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

    const { user } = authResult;
    const userId = user.id;
    const body = await request.json();

    // Validate title and configData before inserting
    if (!body.title || !body.configData) {
      return NextResponse.json(
        { error: 'Title and configuration data are required' },
        { status: 400 }
      );
    }

    const isPublic = typeof body.isPublic === 'boolean' ? body.isPublic : false;

    const [insertedConfig] = await createConfig(
      body.title,
      body.description,
      body.configData,
      isPublic,
      userId
    );

    return NextResponse.json(insertedConfig, { status: 201 });
  } catch (error) {
    console.error('Error creating configuration:', error);
    return NextResponse.json(
      { error: `Failed to create configuration: ${error}` },
      { status: 500 }
    );
  }
}
