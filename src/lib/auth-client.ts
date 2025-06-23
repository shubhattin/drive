import { createAuthClient } from 'better-auth/react';
import { adminClient, usernameClient } from 'better-auth/client/plugins';
import { userInfoPluginClient } from './auth_plugins/user_info/client';

export const authClient = createAuthClient({
  baseURL: (process.env.NEXT_PUBLIC_BETTER_AUTH_URL ?? 'http://localhost:5173') + '/api/auth',
  plugins: [adminClient(), userInfoPluginClient(), usernameClient()]
});

export const { useSession, signIn, signOut, signUp } = authClient;
