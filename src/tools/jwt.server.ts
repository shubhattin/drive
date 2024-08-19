import { z } from 'zod';
import { env } from '$env/dynamic/private';
import { jwtVerify } from 'jose';

export const JWT_SECRET = (() => {
  const token = env.JWT_SECRET;
  const jwt_token_parse = z.string().safeParse(token);
  if (!jwt_token_parse.success) throw new Error('Please set `JWT_SECRET`');
  return new TextEncoder().encode(jwt_token_parse.data);
})();

export const get_verified_id_token_info = async (token: string | undefined) => {
  const jwt_data = await jwtVerify(token!, JWT_SECRET, {
    algorithms: ['HS256']
  });
  return z
    .object({
      user: z.string(),
      type: z.literal('login'),
      iat: z.number().int(),
      exp: z.number().int()
    })
    .parse(jwt_data.payload);
};
