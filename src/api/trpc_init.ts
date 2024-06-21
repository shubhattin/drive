import type { dattStruct } from '@langs/model';
import type { Context } from './context';
import { initTRPC } from '@trpc/server';
import jwt from 'jsonwebtoken';
import { TRPCClientError } from '@trpc/client';
import transformer from './transformer';

export const t = initTRPC.context<Context>().create({
  transformer
});

export const publicProcedure = t.procedure;

export const protectedProcedure = publicProcedure.use(async function isAuthed({
  next,
  ctx: { user, jwt_error }
}) {
  if (!user) {
    let message: keyof typeof dattStruct.drive.login.drive_auth_msgs | 'UNAUTHORIZED' =
      'UNAUTHORIZED';
    if (jwt_error instanceof jwt.TokenExpiredError) message = 'expired_credentials';
    else if (jwt_error instanceof jwt.JsonWebTokenError) message = 'wrong_credentials';
    throw new TRPCClientError(message);
  }
  return next({
    ctx: { user }
  });
});
