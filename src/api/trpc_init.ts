import type { Context } from './context';
import { TRPCError, initTRPC } from '@trpc/server';

export const t = initTRPC.context<Context>().create();

export const publicProcedure = t.procedure;

export const protectedProcedure = publicProcedure.use(async function isAuthed({
  next,
  ctx: { user }
}) {
  if (!user) throw new TRPCError({ code: 'UNAUTHORIZED' });
  return next({
    ctx: { user }
  });
});
