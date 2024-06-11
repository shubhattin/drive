import { z } from 'zod';

export const fileInfoWithUserSchema = z.object({
  key: z.string(),
  user: z.string(),
  name: z.string(),
  mime: z.string(),
  size: z.number(),
  date: z.coerce.date()
});
export const fileInfoSchema = fileInfoWithUserSchema.omit({ user: true });

export type fileInfoType = z.infer<typeof fileInfoSchema>;
export type fileInfoWithUserType = z.infer<typeof fileInfoWithUserSchema>;
