import { sql } from 'drizzle-orm';
import {
  boolean,
  foreignKey,
  pgPolicy,
  pgSchema,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { authUsers } from 'drizzle-orm/supabase';

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
    authorName: varchar('author_name', { length: 128 }).default(''),
    isPublic: boolean('is_public').default(false),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [authUsers.id],
      name: 'configs_table_user_id_fkey',
    }).onDelete('cascade'),
    pgPolicy('Authenticated users can insert their own configs', {
      as: 'permissive',
      for: 'insert',
      to: ['authenticated'],
      withCheck: sql`(auth.uid() = user_id)`,
    }),
    pgPolicy('Users can delete their own configs', {
      as: 'permissive',
      for: 'delete',
      to: ['authenticated'],
    }),
    pgPolicy('Users can update their own configs', {
      as: 'permissive',
      for: 'update',
      to: ['authenticated'],
    }),
    pgPolicy('Users can view their own or public configs', {
      as: 'permissive',
      for: 'select',
      to: ['public'],
    }),
  ]
).enableRLS();

export type Config = typeof configsTable.$inferSelect;
export type NewConfig = typeof configsTable.$inferInsert;

export const authSchema = pgSchema('auth');

export const usersInAuth = authSchema.table('users', {
  id: uuid('id').primaryKey(),
});
