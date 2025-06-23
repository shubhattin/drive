import { pgTable, text, timestamp, uuid, varchar, bigint } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { user } from './auth_schema';

export { user, account, verification } from './auth_schema';

export const folders = pgTable('folders', {
  id: uuid().primaryKey().defaultRandom(),
  name: varchar({ length: 255 }).notNull(),
  createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  userId: text()
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  parentId: uuid().references((): any => folders.id, {
    onDelete: 'cascade' // Or "set null" depending on desired behavior
  })
});

export const files = pgTable('files', {
  id: uuid().primaryKey().defaultRandom(),
  name: varchar({ length: 255 }).notNull(),
  s3Key: varchar({ length: 1024 }).notNull().unique(),
  mimeType: varchar({ length: 100 }).notNull(),
  size: bigint({ mode: 'number' }).notNull(), // Size in bytes
  createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  userId: text()
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  folderId: uuid().references(() => folders.id, {
    onDelete: 'cascade'
  })
});

export const usersRelations = relations(user, ({ many }) => ({
  files: many(files),
  folders: many(folders)
}));

export const foldersRelations = relations(folders, ({ one, many }) => ({
  // Each folder belongs to one user
  user: one(user, {
    fields: [folders.userId],
    references: [user.id]
  }),
  // Each folder can contain many files
  files: many(files),
  // Each folder can have one parent folder
  parent: one(folders, {
    fields: [folders.parentId],
    references: [folders.id],
    relationName: 'parent_folder'
  }),
  // Each folder can have many child folders
  children: many(folders, {
    relationName: 'parent_folder'
  })
}));

export const filesRelations = relations(files, ({ one }) => ({
  // Each file belongs to one user
  user: one(user, {
    fields: [files.userId],
    references: [user.id]
  }),
  // Each file can belong to one folder
  folder: one(folders, {
    fields: [files.folderId],
    references: [folders.id]
  })
}));
