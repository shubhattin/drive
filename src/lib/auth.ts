import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '../db/db';
import * as schema from '../db/schema';
import { admin, openAPI, username } from 'better-auth/plugins';
import { userInfoPlugin } from './auth_plugins/user_info/server';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: schema
  }),
  // emailAndPassword: {
  //   enabled: true
  // },
  plugins: [
    username({
      minUsernameLength: 6,
      maxUsernameLength: 20
    }),
    admin(),
    userInfoPlugin()
    // captcha({
    //   provider: 'cloudflare-turnstile',
    //   secretKey: env.TURNSTILE_SECRET_KEY!
    // })
  ]
});
