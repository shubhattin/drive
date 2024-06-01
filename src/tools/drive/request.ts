import { getTime, deleteCookie } from '@tools/cookies';
import { router_push } from '@tools/i18n';
import {
  ACCESS_ID,
  AUTH_ID,
  storeAuthCookies,
  COOKIE_LOC,
  getCookieVal,
  get_access_token_info
} from './cookie_info';
export * from './cookie_info';
import { isLocalStorage } from '@state/ref/drive/shared';
import { client, setJwtToken } from '@api/client';

export const ensure_jwt_status = async () => {
  if (!getCookieVal(AUTH_ID)) {
    router_push('/drive/login');
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
