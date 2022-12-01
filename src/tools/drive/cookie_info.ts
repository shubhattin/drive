import { setCookie, getTime } from 'tools/cookies';
import { isLocalStorage } from 'state/ref/drive/shared';
export const AUTH_ID = 'drive_auth_id';
export const ACCESS_ID = 'drive_access_id';
export const ACCESS_ID_EXPIRE = `${ACCESS_ID}_expire`;
export const COOKIE_LOC = '/';
/**
 * `Type` of Response of `POST` `/drive/login`
 */
export interface authRes {
  id_token: string;
  id_token_expire: number;
  access_token: string;
  access_token_expire: number;
  token_type: 'bearer';
}
export const storeAuthCookies = (res: authRes) => {
  if (isLocalStorage) {
    setCookie(AUTH_ID, res.id_token, res.id_token_expire, COOKIE_LOC);
    localStorage.setItem(ACCESS_ID, res.access_token);
    localStorage.setItem(ACCESS_ID_EXPIRE, (getTime() + res.access_token_expire).toString());
  } else {
    sessionStorage.setItem(AUTH_ID, res.id_token);
    sessionStorage.setItem(ACCESS_ID, res.access_token);
    sessionStorage.setItem(ACCESS_ID_EXPIRE, (getTime() + res.access_token_expire).toString());
  }
};
