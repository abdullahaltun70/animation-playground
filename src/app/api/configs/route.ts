import { NextRequest, NextResponse } from 'next/server';

import { createConfig } from '@/db/queries/create';
import { getConfigsByUserId } from '@/db/queries/read';
import { createClient } from '@/utils/supabase/server';

// GET /api/configs - Get all configurations for the current user
export async function GET() {
	try {
		// Create Supabase client and properly await it
		const supabase = await createClient();
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const userId = user.id;

		const configs = await getConfigsByUserId(userId);

		return NextResponse.json(configs);
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
		// Create Supabase client and properly await it
		const supabase = await createClient();
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
