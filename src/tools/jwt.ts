import { z } from 'zod';
import { env } from '$env/dynamic/private';
import jsonwebtoken from 'jsonwebtoken';

export const JWT_SECRET = (() => {
  const token = env.JWT_SECRET;
  const jwt_token_parse = z.string().safeParse(token);
  if (!jwt_token_parse.success) throw new Error('Please set `JWT_SECRET`');
  return jwt_token_parse.data;
})();

export const get_verified_id_token_info = (token: string | undefined) => {
  const payload = jsonwebtoken.verify(token!, JWT_SECRET);
  return z
    .object({
      user: z.string(),
      type: z.literal('login'),
      iat: z.number().int(),
      exp: z.number().int()
    })
    .parse(payload);
};
