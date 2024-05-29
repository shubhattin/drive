import { z } from 'zod';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '@tools/jwt';
import type { RequestEvent } from '@sveltejs/kit';
import type { inferAsyncReturnType } from '@trpc/server';

const access_token_payload_schema = z.object({
  user: z.string(),
  type: z.literal('api')
});

export async function createContext(event: RequestEvent) {
  const { request } = event;

  async function getUserFromHeader() {
    let payload: z.infer<typeof access_token_payload_schema>;
    try {
      const access_tokem = request.headers.get('Authorization')?.split(' ')[1]!;
      payload = access_token_payload_schema.parse(jwt.verify(access_tokem, JWT_SECRET));
      return payload;
    } catch {}
    return null;
  }

  const user = await getUserFromHeader();
  return {
    user
  };
}

export type Context = inferAsyncReturnType<typeof createContext>;
