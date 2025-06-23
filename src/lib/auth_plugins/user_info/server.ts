import { type BetterAuthPlugin } from 'better-auth';
import { createAuthEndpoint } from 'better-auth/plugins';
import { z } from 'zod';
import { auth } from '~/lib/auth';

export const userInfoPlugin = () => {
  return {
    id: 'additional_user_info',
    schema: {
      user: {
        fields: {
          is_approved: {
            type: 'boolean',
            defaultValue: false
          }
        }
      }
    },
    endpoints: {
      approve_user: createAuthEndpoint(
        '/user_info/approve_user',
        {
          method: 'POST',
          requireHeaders: true,
          body: z.object({
            userId: z.string()
          })
        },
        async (ctx) => {
          const session = await auth.api.getSession({
            headers: ctx.headers
          });
          if (!session) return ctx.error('UNAUTHORIZED');
          const { user } = session;
          if (!user.is_approved || user.role !== 'admin') return ctx.error('FORBIDDEN');

          const updatedUser = await ctx.context.internalAdapter.updateUser(
            ctx.body.userId,
            {
              is_approved: true
            },
            ctx
          );

          return ctx.json({
            user: updatedUser
          });
        }
      )
    }
  } satisfies BetterAuthPlugin;
};
