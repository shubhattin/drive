import { fetch_post } from '@tools/fetch';
import { getCookie, getTime, deleteCookie } from '@tools/cookies';
import { router_push } from '@tools/i18n';
import { ACCESS_ID, ACCESS_ID_EXPIRE, AUTH_ID, storeAuthCookies, COOKIE_LOC } from './cookie_info';
import type { authRes } from './cookie_info';
export * from './cookie_info';
import { isLocalStorage } from '@state/ref/drive/shared';

export const getCookieVal = (key: string) => {
  if (isLocalStorage) return getCookie(key);
  else return sessionStorage.getItem(key);
};
export const getLocalVal = (key: string) => {
  if (isLocalStorage) return localStorage.getItem(key);
  else return sessionStorage.getItem(key);
};

type variables = {
  [x in string]: any;
};
export const graphql = async (query: string, vars: variables = {}) => {
  if (!getCookieVal(AUTH_ID)) {
    router_push('/drive/login');
  } else if (parseInt(getLocalVal(ACCESS_ID_EXPIRE)!) - getTime() < 0) {
    const req = await fetch_post('/drive/login_navIkaraNam');
    storeAuthCookies((await req.json()) as authRes);
  }
  const token = getLocalVal(ACCESS_ID);
  const req = await fetch_post('/api/drive', {
    json: { query: query, variables: vars },
    headers: { Authorization: `Bearer ${token}` }
  });
  return (await req.json()).data;
};

export const deleteAuthCookies = () => {
  if (isLocalStorage) {
    deleteCookie(AUTH_ID, COOKIE_LOC);
    localStorage.removeItem(ACCESS_ID);
    localStorage.removeItem(ACCESS_ID_EXPIRE);
  } else {
    sessionStorage.removeItem(AUTH_ID);
    sessionStorage.removeItem(ACCESS_ID);
    sessionStorage.removeItem(ACCESS_ID_EXPIRE);
  }
};
