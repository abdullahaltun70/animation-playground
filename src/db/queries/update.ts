import { eq } from 'drizzle-orm';

import { db } from '@/db';

import { configsTable, SelectConfig } from '../schema';

export async function updateConfig(
	id: SelectConfig['id'],
	data: Partial<Omit<SelectConfig, 'id'>>,
) {
	await db.update(configsTable).set(data).where(eq(configsTable.id, id));
}
