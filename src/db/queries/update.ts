import { eq, and } from 'drizzle-orm';

import { db } from '@/db';
import { configsTable, Config } from '@/db/schema';

export async function updateConfig(
  id: string,
  userId: string,
  dataToUpdate: Partial<
    Omit<Config, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  >
): Promise<Config[]> {
  try {
    const updatedConfigs = await db
      .update(configsTable)
      .set(dataToUpdate)
      .where(and(eq(configsTable.id, id), eq(configsTable.userId, userId))) // Ensure ID and User match!
      .returning();

    if (!updatedConfigs || updatedConfigs.length === 0) {
      // This could mean not found OR forbidden, the API layer check is important
      throw new Error('Configuration not found or user unauthorized.');
    }
    return updatedConfigs;
  } catch (error) {
    console.error('[DB Query - Drizzle] Error updating config:', error);
    throw error;
  }
}
