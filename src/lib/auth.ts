import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '../db/db';
import * as schema from '../db/schema';
import { admin, openAPI, username } from 'better-auth/plugins';
import { userInfoPlugin } from './auth_plugins/user_info/server';
import { redis } from '~/db/redis';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: schema
  }),
  emailAndPassword: {
    enabled: true
  },
  plugins: [
    username({
      minUsernameLength: 6,
      maxUsernameLength: 20
    }),
    admin(),
    userInfoPlugin(),
    ...(process.env.NODE_ENV === 'development' ? [openAPI()] : [])
    // captcha({
    //   provider: 'cloudflare-turnstile',
    //   secretKey: env.TURNSTILE_SECRET_KEY!
    // })
  ],
  secondaryStorage: {
    get: async (key) => {
      const value = (await redis.get(key)) as null | any;
      return value ? JSON.stringify(value) : null;
    },
    set: async (key, value, ttl) => {
      if (ttl)
        await redis.set(key, value, {
          ex: ttl
        });
      else await redis.set(key, value);
    },
    delete: async (key) => {
      await redis.del(key);
    }
  }
});
