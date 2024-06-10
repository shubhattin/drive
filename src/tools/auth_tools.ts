import { setCookie, getCookie } from '@tools/cookies';
import { isLocalStorage } from '@state/ref/drive/shared';
import { from_base64 } from '@tools/kry/gupta';
import { z } from 'zod';
import { getTime, deleteCookie } from '@tools/cookies';
import { router_push } from '@tools/i18n';
import { client, setJwtToken } from '@api/client';

export const getCookieVal = (key: string) => {
  if (isLocalStorage) return getCookie(key);
  else return sessionStorage.getItem(key);
};
export const getLocalVal = (key: string) => {
  if (isLocalStorage) return localStorage.getItem(key);
  else return sessionStorage.getItem(key);
};

export const AUTH_ID = 'drive_auth_id'; // id token
export const ACCESS_ID = 'drive_access_id';
export const COOKIE_LOC = '/';

export interface authRes {
  id_token: string;
  access_token: string;
}
export const storeAuthCookies = (res: authRes) => {
  if (isLocalStorage) {
    localStorage.setItem(ACCESS_ID, res.access_token);
    setCookie(AUTH_ID, res.id_token, get_access_token_info().exp, COOKIE_LOC);
  } else {
    sessionStorage.setItem(AUTH_ID, res.id_token);
    sessionStorage.setItem(ACCESS_ID, res.access_token);
  }
};

const JWT_HEADER_SCHEMA = z.object({
  alg: z.literal('HS256'),
  typ: z.literal('JWT')
});

export const get_id_token_info = () => {
  const cookie = isLocalStorage ? getCookieVal(AUTH_ID)! : sessionStorage.getItem(AUTH_ID)!;

  // header parsing :- not returning it as it typically not required, but verifying it to be more sure of the integrity of the token
  JWT_HEADER_SCHEMA.parse(JSON.parse(from_base64(cookie.split('.')[0])));

  const payload = z
    .object({
      user: z.string(),
      type: z.literal('login'),
      iat: z.number().int(),
      exp: z.number().int()
    })
    .parse(JSON.parse(from_base64(cookie.split('.')[1])));
  if (payload.exp - getTime() <= 0) throw new Error('expired');
  return payload;
};

export const get_access_token_info = () => {
  const cookie = isLocalStorage
    ? localStorage.getItem(ACCESS_ID)!
    : sessionStorage.getItem(ACCESS_ID)!;

  // header parsing :- not returning it as it typically not required, but verifying it to be more sure of the integrity of the token
  JWT_HEADER_SCHEMA.parse(JSON.parse(from_base64(cookie.split('.')[0])));

  const payload = z
    .object({
      user: z.string(),
      type: z.literal('api'),
      iat: z.number().int(),
      exp: z.number().int()
    })
    .parse(JSON.parse(from_base64(cookie.split('.')[1])));
  if (payload.exp - getTime() <= 0) throw new Error('expired');
  return payload;
};

export const ensure_auth_access_status = async () => {
  try {
    get_id_token_info();
  } catch {
    deleteAuthCookies();
    router_push('/login');
    return;
  }

  // renewing our tokens if access token is expired
  try {
    get_access_token_info();
  } catch (e: any) {
    if (e instanceof Error) {
      if (e.message === 'expired') await renew_tokens_after_access_expire();
    }
  }
};

export const deleteAuthCookies = () => {
  if (isLocalStorage) {
    deleteCookie(AUTH_ID, COOKIE_LOC);
    localStorage.removeItem(ACCESS_ID);
  } else {
    sessionStorage.removeItem(AUTH_ID);
    sessionStorage.removeItem(ACCESS_ID);
  }
  setJwtToken('');
};

export async function renew_tokens_after_access_expire() {
  const res = await client.auth.renew_access_token.query({
    id_token: getCookieVal(AUTH_ID)!
  });
  if (!res.verified) return;
  storeAuthCookies(res);
  setJwtToken(res.access_token);
}
