import { sql } from 'drizzle-orm';
import {
	pgTable,
	foreignKey,
	pgPolicy,
	text,
	varchar,
	uuid,
	timestamp,
	pgEnum,
	pgSchema,
} from 'drizzle-orm/pg-core';
import { authUsers } from 'drizzle-orm/supabase';

export const role = pgEnum('role', ['DESIGNER', 'DEVELOPER']);

export const configsTable = pgTable(
	'configs_table',
	{
		id: uuid().primaryKey().defaultRandom(),
		title: varchar({ length: 30 }).default('').notNull(),
		description: varchar({ length: 255 }).default(''),
		configData: text('config_data'),
		userId: uuid('user_id')
			.default(sql`auth.uid()`)
			.notNull(),
		createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp('updated_at', {
			withTimezone: true,
			mode: 'string',
		}).defaultNow(),
	},
	(table) => [
		foreignKey({
			columns: [table.userId],
			foreignColumns: [authUsers.id],
			name: 'configs_table_user_id_fkey',
		}).onDelete('cascade'),
		pgPolicy('Enable users to view their own data only', {
			as: 'permissive',
			for: 'select',
			to: ['authenticated'],
			using: sql`(( SELECT auth.uid() AS uid) = user_id)`,
		}),
		pgPolicy('Enable insert for users based on user_id', {
			as: 'permissive',
			for: 'insert',
			to: ['public'],
		}),
		pgPolicy('Enable insert for authenticated users only', {
			as: 'permissive',
			for: 'insert',
			to: ['authenticated'],
		}),
		pgPolicy('Enable insert for authenticated users', {
			as: 'permissive',
			for: 'insert',
			to: ['authenticated'],
		}),
	],
);

export type Config = typeof configsTable.$inferSelect;
export type NewConfig = typeof configsTable.$inferInsert;

export const authSchema = pgSchema('auth');

export const usersInAuth = authSchema.table('users', {
	id: uuid('id').primaryKey(),
});
