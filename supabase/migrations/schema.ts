import { sql } from 'drizzle-orm';
import {
	pgTable,
	foreignKey,
	pgPolicy,
	integer,
	text,
	varchar,
	uuid,
	timestamp,
	boolean,
	pgEnum,
} from 'drizzle-orm/pg-core';

export const role = pgEnum('role', ['DESIGNER', 'DEVELOPER']);

export const configsTable = pgTable(
	'configs_table',
	{
		id: integer().primaryKey().generatedByDefaultAsIdentity({
			name: 'configs_table_id_seq',
			startWith: 1,
			increment: 1,
			minValue: 1,
			maxValue: 2147483647,
			cache: 1,
		}),
		configData: text('config_data'),
		title: varchar({ length: 30 }).default('').notNull(),
		description: varchar({ length: 255 }).default(''),
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
		isPublic: boolean('is_public').default(false),
	},
	(table) => [
		foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: 'configs_table_user_id_fkey',
		}).onDelete('cascade'),
		pgPolicy('Enable read access for all users', {
			as: 'permissive',
			for: 'select',
			to: ['public'],
			using: sql`true`,
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
