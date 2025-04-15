// src/db/queries/create.ts
import { db } from '@/db';
import { configsTable } from '@/db/schema';
import { Config } from '@/db/schema';

/**
 * Creates a new configuration record in the database.
 *
 * @param title - Configuration title
 * @param description - Optional configuration description
 * @param configData - Optional JSON configuration data
 * @param isPublic - Whether the config is public or private (boolean)
 * @param userId - ID of user creating the config (UUID)
 *
 * @returns Promise<Config[]> - Array containing the newly created config
 *
 * @throws Error if insert operation fails or returns no data
 *
 * @example
 * const newConfig = await createConfig(
 *   "My Config",
 *   "Description",
 *   "<Animation props={prop} />",
 *   "userId"
 * );
 */
export async function createConfig(
	title: string,
	description: string | null,
	configData: string | null,
	isPublic: boolean,
	userId: string,
): Promise<Config[]> {
	try {
		const insertedConfigs = await db
			.insert(configsTable)
			.values({
				title: title,
				description: description,
				configData: configData,
				isPublic: isPublic,
				userId: userId,
			})
			.returning();

		if (!insertedConfigs || insertedConfigs.length === 0) {
			console.warn(
				'[DB Query - Drizzle] Insert operation succeeded but returned no data.',
			);
			throw new Error(
				'Database insertion failed to return the created config.',
			);
		}

		return insertedConfigs;
	} catch (error) {
		console.error('[DB Query - Drizzle] Error creating config:', error);
		throw error;
	}
}
