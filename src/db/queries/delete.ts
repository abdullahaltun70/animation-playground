import { eq } from 'drizzle-orm';

import { db } from '@/db';

import { configsTable } from '../schema';

export async function deleteConfig(id: string) {
	await db.delete(configsTable).where(eq(configsTable.id, id));
}
