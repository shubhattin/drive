import { UsersSchemaZod } from '@db/schema_zod';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '@tools/jwt';
import type { RequestEvent } from '@sveltejs/kit';
import type { inferAsyncReturnType } from '@trpc/server';

const jwt_payload_schema = z.object({
  id: z.object(),
  is_admin: true
});

export async function createContext(event: RequestEvent) {
  const { request } = event;

  async function getUserFromHeader() {
    let payload: z.infer<typeof jwt_payload_schema>;
    try {
      const jwt_token = request.headers.get('Authorization')?.split(' ')[1]!;
      payload = jwt_payload_schema.parse(jwt.verify(jwt_token, JWT_SECRET));
      return payload;
    } catch {}
    return null;
  }

  const user = await getUserFromHeader();
  return {
  //  
  };
}

export type Context = inferAsyncReturnType<typeof createContext>;
