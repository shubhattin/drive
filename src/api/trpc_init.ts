import type { dattStruct } from '@langs/model';
import type { Context } from './context';
import { TRPCError, initTRPC } from '@trpc/server';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';

export const t = initTRPC.context<Context>().create();

export const publicProcedure = t.procedure;

export const protectedProcedure = publicProcedure.use(async function isAuthed({
  next,
  ctx: { user, jwt_error }
}) {
  if (!user) {
    let message: keyof typeof dattStruct.drive.login.drive_auth_msgs | 'UNAUTHORIZED' =
      'UNAUTHORIZED';
    if (jwt_error instanceof TokenExpiredError) message = 'expired_credentials';
    else if (jwt_error instanceof JsonWebTokenError) message = 'wrong_credentials';
    throw new TRPCError({ code: 'UNAUTHORIZED', message });
  }
  return next({
    ctx: { user }
  });
});
