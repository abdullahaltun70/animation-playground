import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

import { db } from '@/db';
import { configsTable } from '@/db/schema';
import { createClient } from '@/utils/supabase/server';

// GET /api/configs - Get all configurations for the current user
export async function GET(request: NextRequest) {
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

		const configs = await db
			.select()
			.from(configsTable)
			.where(eq(configsTable.userId, userId));

		return NextResponse.json(configs);
	} catch (error) {
		console.error('Error fetching configurations:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch configurations' },
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

		// Validate required fields
		if (!body.title || !body.configData) {
			return NextResponse.json(
				{ error: 'Title and configuration data are required' },
				{ status: 400 },
			);
		}

		const newConfig = {
			title: body.title,
			description: body.description || '',
			configData: body.configData,
			userId,
		};

		const [insertedConfig] = await db
			.insert(configsTable)
			.values(newConfig)
			.returning();

		return NextResponse.json(insertedConfig, { status: 201 });
	} catch (error) {
		console.error('Error creating configuration:', error);
		return NextResponse.json(
			{ error: 'Failed to create configuration' },
			{ status: 500 },
		);
	}
}
