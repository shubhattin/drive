import { setCookie, getTime } from '@tools/cookies';
import { isLocalStorage } from '@state/ref/drive/shared';
import { from_base64 } from '@tools/kry/gupta';
import { getCookieVal } from './request';
import { z } from 'zod';

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
