import { and, eq } from 'drizzle-orm';

import { db } from '@/db';

import { configsTable } from '../schema';

export async function deleteConfig(configId: string, userId: string) {
	await db
		.delete(configsTable)
		.where(and(eq(configsTable.id, configId), eq(configsTable.userId, userId)));
}
