import { NextRequest, NextResponse } from 'next/server';

import { authenticateUser } from '@/app/utils/supabase/authenticateUser';
import { deleteConfig } from '@/db/queries/delete';
import {
  getConfigById,
  getConfigsByUserIdAndConfigId,
} from '@/db/queries/read';
import { updateConfig } from '@/db/queries/update';

// GET /api/configs/[id] - Get a specific configuration
export async function GET(
  request: NextRequest,
  { params }: { params: { id: Promise<string> } }
) {
  try {
    const authResult = await authenticateUser(request);
    const configId = await params.id;

    const config = await getConfigById(configId);

    if (!Array.isArray(config) || config.length === 0) {
      return NextResponse.json(
        { error: 'Configuration not found' },
        { status: 404 }
      );
    }

    // Check if this is the owner of the config
    let isReadOnly = true;

    if (authResult.user) {
      isReadOnly = config[0].userId !== authResult.user.id;
    }

    // Return the configuration with permission info
    return NextResponse.json(
      {
        ...config[0],
        isReadOnly,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching configuration:', error);
    console.error('Error fetching configuration:', error.stack);
    return NextResponse.json(
      { error: 'Failed to fetch configuration: ' + error.message },
      { status: 500 }
    );
  }
}

// PUT /api/configs/[id] - Update a specific configuration
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: Promise<string> } }
) {
  try {
    const authResult = await authenticateUser(request);

    if (authResult.error) {
      return authResult.error;
    }

    const { user } = authResult;
    const userId = user.id;
    const configId = await params.id;

    const body = await request.json();

    // Validate required fields
    if (!body.title || !body.configData) {
      return NextResponse.json(
        { error: 'Title and configuration data are required' },
        { status: 400 }
      );
    }

    // Checks if the configuration exists and belongs to the user
    const existingConfig = await getConfigsByUserIdAndConfigId(
      userId,
      configId
    );

    if (!existingConfig) {
      return NextResponse.json(
        { error: `Configuration not found: ${configId}` },
        { status: 404 }
      );
    }

    const updateData: Partial<{
      title: string;
      description: string | null;
      configData: string | null;
      isPublic: boolean;
    }> = {};

    updateData.title = body.title;
    if (body.description !== undefined)
      updateData.description = body.description;
    updateData.configData = body.configData;

    if (typeof body.isPublic === 'boolean') updateData.isPublic = body.isPublic;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { message: 'No fields provided for update' },
        { status: 400 }
      );
    }

    const updatedConfig = await updateConfig(configId, userId, updateData);
    return NextResponse.json(updatedConfig);
  } catch (error) {
    console.error('Error updating configuration:', error);
    return NextResponse.json(
      { error: `Failed to update configuration: ${error}` },
      { status: 500 }
    );
  }
}

// DELETE /api/configs/[id] - Delete a specific configuration
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: Promise<string> } }
) {
  try {
    const authResult = await authenticateUser(request);

    if (authResult.error) {
      return authResult.error;
    }

    const { user } = authResult;
    const userId = user.id;
    const configId = await params.id;

    const existingConfig = await getConfigsByUserIdAndConfigId(
      userId,
      configId
    );

    if (!existingConfig) {
      return NextResponse.json(
        { error: `Configuration not found: ${configId}` },
        { status: 404 }
      );
    }

    await deleteConfig(configId, userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting configuration:', error);
    return NextResponse.json(
      { error: `Failed to delete configuration: ${error}` },
      { status: 500 }
    );
  }
}
