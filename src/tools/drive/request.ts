import { fetch_post } from 'tools/fetch';
import { getCookie, getTime, deleteCookie } from 'tools/cookies';
import { Router } from 'state/ref/drive';
import {
  ACCESS_ID,
  ACCESS_ID_EXPIRE,
  AUTH_ID,
  authRes,
  storeAuthCookies,
  COOKIE_LOC
} from './cookie_info';
export * from './cookie_info';
import { isLocalStorage } from 'state/ref/drive/shared';

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
    Router.push('/drive/login');
  } else if (parseInt(getLocalVal(ACCESS_ID_EXPIRE)!) - getTime() < 0) {
    const req = await fetch_post('/drive/login_navIkaraNam', {
      noUrlAdd: true
    });
    storeAuthCookies((await req.json()) as authRes);
  }
  const token = getLocalVal(ACCESS_ID);
  const req = await fetch_post('/drive', {
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
