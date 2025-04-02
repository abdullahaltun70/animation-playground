import { eq } from 'drizzle-orm';

import { db } from '@/db';

import { configsTable } from '../schema';

export async function updateConfig(
	id: string,
	data: Partial<typeof configsTable.$inferSelect>,
) {
	const [updatedRecord] = await db
		.update(configsTable)
		.set(data)
		.where(eq(configsTable.id, id))
		.returning();

	return updatedRecord;
}
