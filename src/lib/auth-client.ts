import { createAuthClient } from 'better-auth/react';
import { adminClient } from 'better-auth/client/plugins';

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL ?? 'http://localhost:5173',
  plugins: [adminClient()]
});

export const { useSession, signIn, signOut, signUp } = authClient;
