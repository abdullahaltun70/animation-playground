import { NextRequest, NextResponse } from 'next/server';

import {
  getConfigByIdAction,
  getConfigByUserIdAndConfigIdAction,
  updateConfigAction,
  removeConfigAction,
} from '@/app/utils/actions/supabase/configs';
import { authenticateUser } from '@/app/utils/supabase/authenticateUser';

/**
 * @swagger
 * /api/configs/{id}:
 *   get:
 *     summary: Retrieve a specific animation configuration by its ID.
 *     description: >
 *       Fetches a configuration. If the user is authenticated and owns the configuration,
 *       it returns the full configuration data with `isReadOnly` set to `false`.
 *       If the user is not authenticated or does not own the configuration, it returns the
 *       configuration data only if it's public, with `isReadOnly` set to `true`.
 *       Returns a 403 error for private configurations if the user is not the owner.
 *       Returns a 404 error if the configuration is not found.
 *     tags:
 *       - Configurations
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the animation configuration to retrieve.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved the configuration.
 *       400:
 *         description: Invalid configuration ID provided.
 *       403:
 *         description: Forbidden. Configuration is private and user is not the owner.
 *       404:
 *         description: Configuration not found.
 *       500:
 *         description: Failed to fetch configuration due to a server error.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const authResult = await authenticateUser(request);
    const configId = params.id; // params is already an object

    if (!configId || configId === 'undefined') {
      return NextResponse.json(
        { error: 'Invalid configuration ID provided' },
        { status: 400 }
      );
    }

    const result = await getConfigByIdAction(configId);

    if (!result.success || !result.data) {
      return NextResponse.json(
        { error: result.message || 'Configuration not found' },
        { status: 404 }
      );
    }

    const config = result.data;
    let isReadOnly = true;

    if (authResult.user) {
      isReadOnly = config.userId !== authResult.user.id;
    } else if (!config.isPublic) {
      return NextResponse.json(
        { error: 'Forbidden - Configuration is private.' },
        { status: 403 }
      );
    }

    if (isReadOnly && !config.isPublic) {
      return NextResponse.json(
        {
          error:
            'Forbidden - Configuration is private and you are not the owner.',
        },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        ...config,
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

/**
 * @swagger
 * /api/configs/{id}:
 *   put:
 *     summary: Update an existing animation configuration.
 *     description: >
 *       Updates a specific animation configuration. The user must be authenticated and
 *       must be the owner of the configuration. The request body should contain
 *       the fields to be updated (e.g., title, description, configData, isPublic).
 *     tags:
 *       - Configurations
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the animation configuration to update.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Successfully updated the configuration.
 *       400:
 *         description: Invalid input, object invalid, or configuration ID missing.
 *       401:
 *         description: Unauthorized. User must be authenticated.
 *       403:
 *         description: Forbidden. User does not own the configuration.
 *       404:
 *         description: Configuration not found or not owned by the user.
 *       500:
 *         description: Failed to update configuration due to a server error.
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const authResult = await authenticateUser(request);
    if (authResult.error || !authResult.user) {
      return (
        authResult.error ||
        NextResponse.json(
          { error: 'User authentication failed.' },
          { status: 401 }
        )
      );
    }

    const authenticatedUserId = authResult.user.id;
    const authenticatedAuthorName =
      authResult.user.user_metadata?.full_name ||
      authResult.user.email ||
      'Anonymous';

    const configId = params.id;
    if (!configId || configId === 'undefined') {
      return NextResponse.json(
        { error: 'Invalid configuration ID provided for update' },
        { status: 400 }
      );
    }

    const ownershipCheck = await getConfigByUserIdAndConfigIdAction(
      configId,
      authenticatedUserId
    );
    if (!ownershipCheck.success) {
      return NextResponse.json(
        {
          error:
            ownershipCheck.message ||
            'Configuration not found or not owned by user',
        },
        { status: ownershipCheck.message?.includes('not owned') ? 403 : 404 }
      );
    }

    const body = await request.json();
    if (!body.title || !body.configData) {
      return NextResponse.json(
        { error: 'Title and configuration data are required' },
        { status: 400 }
      );
    }

    const updateData: Partial<{
      title: string;
      description: string | null;
      configData: string | null;
      isPublic?: boolean;
    }> = {};
    updateData.title = body.title;
    if (body.description !== undefined) {
      updateData.description = body.description;
    }
    updateData.configData = body.configData; // Assuming it's a stringified JSON
    if (typeof body.isPublic === 'boolean') {
      updateData.isPublic = body.isPublic;
    }

    const updateResult = await updateConfigAction(
      configId,
      updateData,
      authenticatedUserId,
      authenticatedAuthorName
    );

    if (!updateResult.success || !updateResult.data) {
      let status = 500;
      if (updateResult.message?.includes('not found')) status = 404;
      else if (updateResult.message?.includes('cannot exceed')) status = 400;
      return NextResponse.json(
        { error: updateResult.message || 'Failed to update configuration' },
        { status }
      );
    }
    return NextResponse.json(updateResult.data, { status: 200 });
  } catch (error) {
    console.error(`[API PUT /api/configs/${params.id}] Error:`, error);
    const message =
      error instanceof Error
        ? error.message
        : 'An unknown server error occurred.';
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid JSON payload' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: `Failed to update configuration: ${message}` },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/configs/{id}:
 *   delete:
 *     summary: Delete an animation configuration.
 *     description: >
 *       Deletes a specific animation configuration. The user must be authenticated and
 *       must be the owner of the configuration.
 *     tags:
 *       - Configurations
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the animation configuration to delete.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully deleted the configuration.
 *       400:
 *         description: Invalid configuration ID provided.
 *       401:
 *         description: Unauthorized. User must be authenticated.
 *       403:
 *         description: Forbidden. User does not own the configuration.
 *       404:
 *         description: Configuration not found or not owned by the user.
 *       500:
 *         description: Failed to delete configuration due to a server error.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const authResult = await authenticateUser(request);
    if (authResult.error || !authResult.user) {
      return (
        authResult.error ||
        NextResponse.json(
          { error: 'User authentication failed.' },
          { status: 401 }
        )
      );
    }
    const authenticatedUserId = authResult.user.id;

    const configId = params.id;
    if (!configId || configId === 'undefined') {
      return NextResponse.json(
        { error: 'Invalid configuration ID provided for deletion' },
        { status: 400 }
      );
    }

    const ownershipCheck = await getConfigByUserIdAndConfigIdAction(
      configId,
      authenticatedUserId
    );
    if (!ownershipCheck.success) {
      return NextResponse.json(
        {
          error:
            ownershipCheck.message ||
            'Configuration not found or not owned by user for deletion',
        },
        { status: ownershipCheck.message?.includes('not owned') ? 403 : 404 }
      );
    }

    const deleteResult = await removeConfigAction(
      configId,
      authenticatedUserId
    );

    if (!deleteResult.success) {
      let status = 500;
      if (deleteResult.message?.includes('not found')) status = 404;
      return NextResponse.json(
        { error: deleteResult.message || 'Failed to delete configuration' },
        { status }
      );
    }
    return NextResponse.json(
      { message: 'Configuration deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error(`[API DELETE /api/configs/${params.id}] Error:`, error);
    const message =
      error instanceof Error
        ? error.message
        : 'An unknown server error occurred.';
    return NextResponse.json(
      { error: `Failed to delete configuration: ${message}` },
      { status: 500 }
    );
  }
}
