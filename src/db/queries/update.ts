import { eq } from 'drizzle-orm';

import { db } from '@/db';

import { configsTable } from '../schema';

async function updateConfig(
	id: number,
	data: Partial<typeof configsTable.$inferSelect>,
) {
	await db.update(configsTable).set(data).where(eq(configsTable.id, id));
}
