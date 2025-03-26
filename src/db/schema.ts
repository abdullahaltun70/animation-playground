import {
	integer,
	json,
	pgEnum,
	pgTable,
	serial,
	text,
	timestamp,
	varchar,
} from 'drizzle-orm/pg-core';

export const ROLE_ENUM = pgEnum('role', ['DESIGNER', 'DEVELOPER']);

export const usersTable = pgTable('users_table', {
	id: serial('id').notNull().primaryKey().unique(),
	email: text('email').notNull().unique(),
	password: text('password').notNull(),
	firstName: text('firstName').notNull(),
	lastName: text('lastName').notNull(),
	role: ROLE_ENUM('ROLE_ENUM').default('DEVELOPER'),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const configsTable = pgTable('configs_table', {
	id: serial('id').primaryKey().notNull(),
	configData: json('config_data'),
	title: varchar('title', { length: 30 }).notNull(),
	description: varchar('description', { length: 255 }),
	userId: integer('user_id')
		.notNull()
		.references(() => usersTable.id, { onDelete: 'cascade' }),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at')
		.notNull()
		.$onUpdate(() => new Date()),
});

export type InsertUser = typeof usersTable.$inferInsert;
export type SelectUser = typeof usersTable.$inferSelect;

export type InsertConfig = typeof configsTable.$inferInsert;
export type SelectConfig = typeof configsTable.$inferSelect;
