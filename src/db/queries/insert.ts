import { db } from '@/db';
import {
	InsertConfig,
	InsertUser,
	usersTable,
	configsTable,
} from '@/db/schema';

export async function createUser(data: InsertUser) {
	await db.insert(usersTable).values(data);
}

export async function createConfig(data: InsertConfig) {
	await db.insert(configsTable).values(data);
}
