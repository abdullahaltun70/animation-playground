import { NextRequest, NextResponse } from 'next/server';

import { getConfigsByUserIdAction } from '@/app/utils/actions/supabase/configs';
import { authenticateUser } from '@/app/utils/supabase/authenticateUser';

/**
 * @swagger
 * /api/configs/my-configs:
 *   get:
 *     summary: Retrieve all configurations for the authenticated user.
 *     description: >
 *       Fetches all animation configurations associated with the currently authenticated user.
 *       The user must be authenticated to access this endpoint.
 *     tags:
 *       - Configurations
 *     security:
 *       - bearerAuth: [] # Indicates that bearer token authentication is required
 *     responses:
 *       200:
 *         description: Successfully retrieved the user's configurations.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AnimationConfig'
 *       401:
 *         description: Unauthorized. User must be authenticated.
 *       500:
 *         description: Failed to fetch configurations due to a server error.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Authenticate the user
    const authResult = await authenticateUser(request);

    // If authentication failed, return the error response
    if (authResult.error) {
      return authResult.error; // Typically a NextResponse with 401 status
    }

    // Ensure user object is available after successful authentication
    if (!authResult.user) {
      return NextResponse.json(
        { error: 'Authentication successful but user data missing' },
        { status: 500 }
      );
    }

    const userId = authResult.user.id;

    // Fetch the user's configurations using the server action
    const result = await getConfigsByUserIdAction(userId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.message || 'Failed to retrieve configurations' },
        { status: 500 }
      );
    }
    return NextResponse.json(result.data || [], { status: 200 });
  } catch (error) {
    console.error('[API GET /api/configs/my-configs] Error:', error);
    const message =
      error instanceof Error
        ? error.message
        : 'An unknown server error occurred.';
    return NextResponse.json(
      { error: `Failed to fetch configurations: ${message}` },
      { status: 500 }
    );
  }
}
