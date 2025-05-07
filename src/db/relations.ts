import { relations } from 'drizzle-orm/relations';

import { configsTable, usersInAuth } from './schema';

export const configsTableRelations = relations(configsTable, ({ one }) => ({
  usersInAuth: one(usersInAuth, {
    fields: [configsTable.userId],
    references: [usersInAuth.id],
  }),
}));

export const usersInAuthRelations = relations(usersInAuth, ({ many }) => ({
  configsTables: many(configsTable),
}));
