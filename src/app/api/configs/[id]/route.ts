import { and, eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

import { db } from '@/db';
import { getConfigsByUserIdAndConfigId } from '@/db/queries/read';
import { updateConfig } from '@/db/queries/update';
import { configsTable } from '@/db/schema';
import { createClient } from '@/utils/supabase/server';

// GET /api/configs/[id] - Get a specific configuration
export async function GET(
	request: NextRequest,
	{ params }: { params: { id: Promise<string> } },
) {
	try {
		const supabase = await createClient();
		const {
			data: { user },
		} = await supabase.auth.getUser();
		const configId = await params.id;

		if (!user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const userId = user.id;

		const [config] = await db
			.select()
			.from(configsTable)
			.where(
				and(eq(configsTable.id, configId), eq(configsTable.userId, userId)),
			);

		if (!config) {
			return NextResponse.json(
				{ error: 'Configuration not found' },
				{ status: 404 },
			);
		}

		return NextResponse.json(config);
	} catch (error: any) {
		console.error('Error fetching configuration:', error);
		console.error('Error fetching configuration:', error.stack);
		return NextResponse.json(
			{ error: 'Failed to fetch configuration: ' + error.message },
			{ status: 500 },
		);
	}
}

// PUT /api/configs/[id] - Update a specific configuration
export async function PUT(
	request: NextRequest,
	{ params }: { params: { id: Promise<string> } },
) {
	try {
		const supabase = await createClient();
		const {
			data: { user },
		} = await supabase.auth.getUser();
		const configId = await params.id;

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

		// Check if the configuration exists and belongs to the user
		const existingConfig = await getConfigsByUserIdAndConfigId(
			userId,
			configId,
		);

		if (!existingConfig) {
			return NextResponse.json(
				{ error: `Configuration not found: ${configId}` },
				{ status: 404 },
			);
		}

		const updatedConfig = {
			title: body.title,
			description: body.description || '',
			configData: body.configData,
			updatedAt: new Date().toISOString(),
		};

		const res = await updateConfig(configId, updatedConfig);

		return NextResponse.json(res);
	} catch (error) {
		console.error('Error updating configuration:', error);
		return NextResponse.json(
			{ error: `Failed to update configuration: ${error}` },
			{ status: 500 },
		);
	}
}

// DELETE /api/configs/[id] - Delete a specific configuration
export async function DELETE(
	request: NextRequest,
	{ params }: { params: { id: Promise<string> } },
) {
	try {
		const supabase = await createClient();
		const {
			data: { user },
		} = await supabase.auth.getUser();
		const configId = await params.id;

		if (!user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const userId = user.id;

		// Check if the configuration exists and belongs to the user
		const [existingConfig] = await db
			.select()
			.from(configsTable)
			.where(
				and(eq(configsTable.id, configId), eq(configsTable.userId, userId)),
			);

		if (!existingConfig) {
			return NextResponse.json(
				{ error: 'Configuration not found' },
				{ status: 404 },
			);
		}

		await db
			.delete(configsTable)
			.where(
				and(eq(configsTable.id, configId), eq(configsTable.userId, userId)),
			);

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Error deleting configuration:', error);
		return NextResponse.json(
			{ error: 'Failed to delete configuration' },
			{ status: 500 },
		);
	}
}
