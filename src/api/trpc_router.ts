import { t } from './trpc_init';
import { files_router } from './routers/files';

export const appRouter = t.router({
  files: files_router
});

export type AppRouter = typeof appRouter;
