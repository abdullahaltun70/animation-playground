import { and, desc, eq } from 'drizzle-orm';

import { db } from '@/db';

import { configsTable } from '../schema';

export async function getAllConfigs() {
  return db.select().from(configsTable).orderBy(desc(configsTable.updatedAt));
}

export async function getConfigById(id: string) {
  return db.select().from(configsTable).where(eq(configsTable.id, id)).limit(1);
}

export async function getConfigsByUserId(userId: string) {
  if (!userId) {
    throw new Error('Invalid user ID');
  }
  return db
    .select()
    .from(configsTable)
    .where(eq(configsTable.userId, userId))
    .orderBy(desc(configsTable.createdAt));
}

export async function getConfigsByUserIdAndConfigId(
  userId: string,
  configId: string
) {
  if (!userId || !configId) {
    throw new Error('Invalid user ID or config ID');
  }

  const [config] = await db
    .select()
    .from(configsTable)
    .where(and(eq(configsTable.id, configId), eq(configsTable.userId, userId)));

  return config;
}
