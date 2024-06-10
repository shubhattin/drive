import { z } from 'zod';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '@tools/jwt.server';
import type { RequestEvent } from '@sveltejs/kit';
import type { inferAsyncReturnType } from '@trpc/server';

const access_token_payload_schema = z.object({
  user: z.string(),
  type: z.literal('api')
});

const getUserFromHeader = (
  req: Request
): [z.infer<typeof access_token_payload_schema> | null, any] => {
  const { headers } = req;
  let payload: z.infer<typeof access_token_payload_schema>;
  try {
    const access_tokem = headers.get('Authorization')?.split(' ')[1]!; // formar :-  Bearer access_token
    payload = access_token_payload_schema.parse(jwt.verify(access_tokem, JWT_SECRET));
    return [payload, null];
  } catch (error) {
    // this error information will be later used in protected procedures to give expired or invalid jwt message
    return [null, error];
  }
};

export async function createContext(event: RequestEvent) {
  const { request } = event;

  const [user, jwt_error] = getUserFromHeader(request);
  return {
    user,
    jwt_error
  };
}

export type Context = inferAsyncReturnType<typeof createContext>;
