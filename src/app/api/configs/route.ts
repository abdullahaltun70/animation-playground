import { NextRequest, NextResponse } from 'next/server';

import { createConfig } from '@/db/queries/create';
import { getConfigsByUserId } from '@/db/queries/read';
import { createClient } from '@/utils/supabase/server';

// GET /api/configs - Get all configurations for the current user
export async function GET(request: NextRequest) {
	try {
		// Create Supabase client
		const supabase = await createClient();
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
				return NextResponse.json(
					{ error: 'Invalid or expired token | Unauthorized' },
					{ status: 401 },
				);
			}

			user = tokenUser;
		} else {
			// No Bearer token, try cookie-based authentication (for browser clients)
			const {
				data: { user: cookieUser },
				error: cookieError,
			} = await supabase.auth.getUser();

			if (cookieError || !cookieUser) {
				return NextResponse.json(
					{ error: 'Unauthorized - Please log in' },
					{ status: 401 },
				);
			}

			user = cookieUser;
		}

		// At this point, we have an authenticated user from either method
		const userId = user.id;

		const configs = await getConfigsByUserId(userId);

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
			{ status: 500 },
		);
	}
}

// POST /api/configs - Create a new configuration
export async function POST(request: NextRequest) {
	try {
		// Create Supabase client
		const supabase = await createClient();
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
				return NextResponse.json(
					{ error: 'Invalid or expired token | Unauthorized' },
					{ status: 401 },
				);
			}

			user = tokenUser;
		} else {
			// No Bearer token, try cookie-based authentication (for browser clients)
			const {
				data: { user: cookieUser },
				error: cookieError,
			} = await supabase.auth.getUser();

			if (cookieError || !cookieUser) {
				return NextResponse.json(
					{ error: 'Unauthorized - Please log in' },
					{ status: 401 },
				);
			}

			user = cookieUser;
		}

		const userId = user.id;
		const body = await request.json();

		// Validate title and configData before inserting
		if (!body.title || !body.configData) {
			return NextResponse.json(
				{ error: 'Title and configuration data are required' },
				{ status: 400 },
			);
		}

		const [insertedConfig] = await createConfig(
			body.title,
			body.description,
			body.configData,
			userId,
		);

		return NextResponse.json(insertedConfig, { status: 201 });
	} catch (error) {
		console.error('Error creating configuration:', error);
		return NextResponse.json(
			{ error: `Failed to create configuration: ${error}` },
			{ status: 500 },
		);
	}
}
