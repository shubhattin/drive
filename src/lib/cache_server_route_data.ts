import { cache } from 'react';
import { cookies, headers } from 'next/headers';
import get_seesion_from_cookie from '~/lib/get_auth_from_cookie';

/**
 * A cached function to get the user's session.
 * It will only be executed once per request.
 * Any component can call this function to get the session data.
 */
export const getCachedSession = cache(async () => {
  const cookieHeader = (await headers()).get('cookie') ?? '';
  const session = await get_seesion_from_cookie(cookieHeader);
  return session;
});
