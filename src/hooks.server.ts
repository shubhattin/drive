import type { Handle } from '@sveltejs/kit';
import { default_locale } from './langs';
import { createContext } from '@api/context';
import { router } from '@api/trpc_router';
import { createTRPCHandle } from 'trpc-sveltekit';
import { get_link, get_locale_from_url, get_pure_link } from '@tools/i18n';
import { get_verified_id_token_info } from '@tools/jwt';
import { AUTH_ID } from '@tools/drive/cookie_info';

const handle_trpc = createTRPCHandle({ router, createContext });

export const handle: Handle = async ({ event, resolve }) => {
  if (event.url.pathname.startsWith('/trpc')) {
    return handle_trpc({ event, resolve });
  }

  if (event.request.method === 'GET') {
    const protected_routes = ['/drive'];
    const LOGIN_URL = '/drive/login';
    const DRIVE_URL = '/drive';
    const locale = get_locale_from_url(event.url.pathname);
    const URL = get_pure_link(event.url.pathname);

    let user_verified = false;
    const id_token = event.cookies.get(AUTH_ID);
    try {
      user_verified = !!get_verified_id_token_info(id_token).user;
    } catch {}

    if (protected_routes.includes(URL) && !user_verified) {
      return new Response('Redirect', {
        status: 302,
        headers: { Location: get_link(LOGIN_URL, locale) }
      });
    } else if (URL === LOGIN_URL && user_verified) {
      return new Response('Redirect', {
        status: 302,
        headers: { Location: get_link(DRIVE_URL, locale) }
      });
    }
  }

  return resolve(event, {
    transformPageChunk: ({ html }) => {
      return html.replace('%lang%', event.params.lang || default_locale);
    }
  });
};
