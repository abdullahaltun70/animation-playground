import { eq } from 'drizzle-orm';

import { db } from '@/db';

import { configsTable } from '../schema';

async function deleteConfig(id: number) {
	await db.delete(configsTable).where(eq(configsTable.id, id));
}
