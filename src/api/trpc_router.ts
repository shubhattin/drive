import { auth_router } from './routers/auth';
import { drive_router } from './routers/drive';
import { t } from './trpc_init';

export const router = t.router({
  auth: auth_router,
  drive: drive_router
});

export type Router = typeof router;
