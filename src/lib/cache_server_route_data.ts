import { cache } from 'react';
import { headers } from 'next/headers';
import { auth } from './auth';

/**
 * A cached function to get the user's session.
 * It will only be executed once per request.
 * Any component can call this function to get the session data.
 */
export const getCachedSession = cache(async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  return session;
});
