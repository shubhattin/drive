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

export const get_id_token_info = () => {
  const cookie = isLocalStorage ? getCookieVal(AUTH_ID)! : sessionStorage.getItem(AUTH_ID)!;
  const payload = JSON.parse(from_base64(cookie.split('.')[1]));
  return z
    .object({
      user: z.string(),
      type: z.literal('login'),
      iat: z.number().int(),
      exp: z.number().int()
    })
    .parse(payload);
};

export const get_access_token_info = () => {
  const cookie = isLocalStorage
    ? localStorage.getItem(ACCESS_ID)!
    : sessionStorage.getItem(ACCESS_ID)!;
  const payload = JSON.parse(from_base64(cookie.split('.')[1]));
  return z
    .object({
      user: z.string(),
      type: z.literal('api'),
      iat: z.number().int(),
      exp: z.number().int()
    })
    .parse(payload);
};

export const ensure_jwt_status = async () => {
  if (!getCookieVal(AUTH_ID)) {
    router_push('/login');
    return;
  }
  const access_token_expire = get_access_token_info().exp;
  if (access_token_expire - getTime() <= 0) {
    const res = await client.auth.renew_access_token.query({ id_token: getCookieVal(AUTH_ID)! });
    if (!res.verified) return;
    storeAuthCookies(res);
    setJwtToken(res.access_token);
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
};
