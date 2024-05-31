import { z } from 'zod';

export const fileInfoSchema = z.object({
  name: z.string(),
  mime: z.string(),
  size: z.string(),
  date: z.string(),
  key: z.string()
});

export type fileInfoType = z.infer<typeof fileInfoSchema>;
