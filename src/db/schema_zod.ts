import { z } from 'zod';
import { user, account, verification, files, folders } from './schema';
import { createSelectSchema } from 'drizzle-zod';

export const UserSchemaZod = createSelectSchema(user, {
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  banExpires: z.coerce.date().nullable()
});
export const AccountSchemaZod = createSelectSchema(account, {
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  accessTokenExpiresAt: z.coerce.date().nullable(),
  refreshTokenExpiresAt: z.coerce.date().nullable()
});
export const VerificationSchemaZod = createSelectSchema(verification, {
  createdAt: z.coerce.date().nullable(),
  updatedAt: z.coerce.date().nullable(),
  expiresAt: z.coerce.date()
});

export const FilesSchemaZod = createSelectSchema(files, {
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date()
});
export const FoldersSchemaZod = createSelectSchema(folders, {
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date()
});
