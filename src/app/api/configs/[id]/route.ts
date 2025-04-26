import { NextRequest, NextResponse } from 'next/server';

import {
  getConfigByIdAction,
  getConfigByUserIdAndConfigIdAction,
  updateConfigAction,
  removeConfigAction,
} from '@/app/utils/actions/supabase/configs';
import { authenticateUser } from '@/app/utils/supabase/authenticateUser';

// GET /api/configs/[id] - Get a specific configuration using Action
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // User might be authenticated or not, we fetch first, then check ownership
    const authResult = await authenticateUser(request);
    const configId = params.id;

    if (!configId || configId === 'undefined') {
      return NextResponse.json(
        { error: 'Invalid configuration ID provided' },
        { status: 400 }
      );
    }

    // Call the server action to get the config data
    const result = await getConfigByIdAction(configId);

    if (!result.success || !result.data) {
      // Action failed (e.g., not found)
      return NextResponse.json(
        { error: result.message || 'Configuration not found' },
        { status: 404 } // Use 404 for not found
      );
    }

    const config = result.data;

    // Check if the user (if logged in) is the owner
    let isReadOnly = true; // Default to read-only
    if (authResult.user) {
      // If user is logged in, check if their ID matches the config's userId
      isReadOnly = config.userId !== authResult.user.id;
    } else if (!config.isPublic) {
      // If user is not logged in AND config is not public, deny access
      return NextResponse.json(
        { error: 'Forbidden - Configuration is private.' },
        { status: 403 }
      );
    }

    // If user is not owner AND config is not public, deny access
    if (isReadOnly && !config.isPublic) {
      return NextResponse.json(
        {
          error:
            'Forbidden - Configuration is private and you are not the owner.',
        },
        { status: 403 }
      );
    }

    // Return the configuration with ownership info
    return NextResponse.json(
      {
        ...config, // Spread the config data from the action result
        isReadOnly,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(`[API GET /api/configs/${params.id}] Error:`, error);
    const message =
      error instanceof Error
        ? error.message
        : 'An unknown server error occurred.';
    return NextResponse.json(
      { error: `Failed to fetch configuration: ${message}` },
      { status: 500 }
    );
  }
}

// PUT /api/configs/[id] - Update a specific configuration using Action
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Must be authenticated to update
    const authResult = await authenticateUser(request);
    if (authResult.error) {
      return authResult.error; // Returns 401 Unauthorized
    }
    // No need for userId from authResult here, updateConfigAction handles it

    const configId = params.id;
    if (!configId || configId === 'undefined') {
      return NextResponse.json(
        { error: 'Invalid configuration ID provided for update' },
        { status: 400 }
      );
    }

    // First, verify the user owns the config using the specific action
    // Note: updateConfigAction *also* verifies ownership internally, but this check
    // can provide a clearer 404/403 before attempting the update logic.
    const ownershipCheck = await getConfigByUserIdAndConfigIdAction(configId);
    if (!ownershipCheck.success) {
      return NextResponse.json(
        {
          error:
            ownershipCheck.message ||
            'Configuration not found or not owned by user',
        },
        { status: 404 } // Or 403 Forbidden depending on message
      );
    }

    // Proceed with update logic
    const body = await request.json();

    // Basic validation for request body
    if (!body.title || !body.configData) {
      return NextResponse.json(
        { error: 'Title and configuration data are required' },
        { status: 400 }
      );
    }

    // Prepare data, excluding fields handled by the action (like authorName)
    const updateData: Partial<{
      title: string;
      description: string | null;
      configData: string | null;
      isPublic?: boolean; // Make optional as action handles default
    }> = {};

    updateData.title = body.title;
    if (body.description !== undefined)
      updateData.description = body.description;
    updateData.configData = body.configData;
    if (typeof body.isPublic === 'boolean') updateData.isPublic = body.isPublic;

    // Call the update server action
    const updateResult = await updateConfigAction(configId, updateData);

    if (!updateResult.success || !updateResult.data) {
      // Handle potential errors from the action (validation, db error)
      const status = updateResult.message.includes('cannot exceed') ? 400 : 500; // Basic status mapping
      if (updateResult.message.includes('not found')) {
        // If somehow ownership check passed but update failed on not found
        return NextResponse.json(
          { error: updateResult.message },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: updateResult.message || 'Failed to update configuration' },
        { status: status }
      );
    }

    // Return the updated config data from the action's response
    return NextResponse.json(updateResult.data, { status: 200 });
  } catch (error) {
    console.error(`[API PUT /api/configs/${params.id}] Error:`, error);
    if (error instanceof SyntaxError) {
      // Handle JSON parsing error
      return NextResponse.json(
        { error: 'Invalid JSON payload' },
        { status: 400 }
      );
    }
    const message =
      error instanceof Error ? error.message : 'An unknown error occurred.';
    return NextResponse.json(
      { error: `Failed to update configuration: ${message}` },
      { status: 500 }
    );
  }
}

// DELETE /api/configs/[id] - Delete a specific configuration using Action
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Must be authenticated to delete
    const authResult = await authenticateUser(request);
    if (authResult.error) {
      return authResult.error; // Returns 401 Unauthorized
    }
    const { user } = authResult; // Get user to pass ID for deletion

    const configId = params.id;
    if (!configId || configId === 'undefined') {
      return NextResponse.json(
        { error: 'Invalid configuration ID provided for deletion' },
        { status: 400 }
      );
    }

    // Note: removeConfigAction performs its own ownership check using the authenticated user.
    // Calling getConfigByUserIdAndConfigIdAction first is optional but provides a clearer 404/403 check.
    const ownershipCheck = await getConfigByUserIdAndConfigIdAction(configId);
    if (!ownershipCheck.success) {
      return NextResponse.json(
        {
          error:
            ownershipCheck.message ||
            'Configuration not found or not owned by user for deletion',
        },
        { status: 404 } // Or 403 Forbidden
      );
    }

    // Call the remove server action, passing the authenticated user's ID
    const deleteResult = await removeConfigAction(configId, user.id);

    if (!deleteResult.success) {
      // Determine status based on message (e.g., 404 if not found, 403 if permission denied, 500 otherwise)
      let status = 500;
      if (deleteResult.message.includes('not found')) status = 404;
      if (deleteResult.message.includes('permission denied')) status = 403;
      return NextResponse.json(
        { error: deleteResult.message || 'Failed to delete configuration' },
        { status: status }
      );
    }

    // Return success response (No Content)
    // return new NextResponse(null, { status: 204 }); // Alternative: No Content
    return NextResponse.json(
      { message: 'Configuration deleted successfully' },
      { status: 200 }
    ); // Or return simple success message
  } catch (error) {
    console.error(`[API DELETE /api/configs/${params.id}] Error:`, error);
    const message =
      error instanceof Error ? error.message : 'An unknown error occurred.';
    return NextResponse.json(
      { error: `Failed to delete configuration: ${message}` },
      { status: 500 }
    );
  }
}
