import { eq } from 'drizzle-orm';

import { db } from '@/db';

import { configsTable, SelectConfig, SelectUser, usersTable } from '../schema';

export async function getUserById(id: SelectUser['id']): Promise<
	Array<{
		id: number;
		firstName: string;
		lastName: string;
		role: 'DESIGNER' | 'DEVELOPER' | null;
		email: string;
	}>
> {
	return db.select().from(usersTable).where(eq(usersTable.id, id));
}

export async function getConfigById(id: SelectConfig['id']): Promise<
	Array<{
		id: number;
		configData: unknown;
		userId: number;
		createdAt: Date;
		updatedAt: Date;
	}>
> {
	return db.select().from(configsTable).where(eq(configsTable.id, id));
}

export async function getConfigsByUserId(userId: number) {
	return db.select().from(configsTable).where(eq(configsTable.userId, userId));
}
