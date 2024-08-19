import type { Handle } from '@sveltejs/kit';
import { DEFAULT_LOCALE } from '@langs/datt.server';
import { createContext } from '@api/context';
import { router } from '@api/trpc_router';
import { createTRPCHandle } from 'trpc-sveltekit';
import { get_link, get_locale_from_url, get_pure_link } from '@tools/i18n';
import { get_verified_id_token_info } from '@tools/jwt.server';
import { AUTH_ID } from '@tools/auth_tools';

const handle_trpc = createTRPCHandle({ router, createContext });

export const handle: Handle = async ({ event, resolve }) => {
  const { url, request, cookies, params } = event;
  const { method } = request;
  const { pathname } = url;

  if (pathname.startsWith('/trpc')) {
    return handle_trpc({ event, resolve });
  }

  if (method === 'GET') {
    const protected_routes = ['/'];
    const LOGIN_URL = '/login';
    const DRIVE_URL = '/';
    const locale = get_locale_from_url(url.pathname);
    const URL = get_pure_link(url.pathname);

    const url_last_part = (() => {
      const url = request.url.split('/');
      return url[url.length - 1];
    })();

    const IS_DATA_JSON_REQUEST = url_last_part.includes('data.json');

    let user_verified = false;
    const id_token = cookies.get(AUTH_ID);
    try {
      user_verified = !!(await get_verified_id_token_info(id_token)).user;
    } catch {}
    if (!IS_DATA_JSON_REQUEST) {
      if (protected_routes.includes(URL) && !user_verified)
        return redirect_response(get_link(LOGIN_URL, locale));
      else if (URL === LOGIN_URL && user_verified)
        return redirect_response(get_link(DRIVE_URL, locale));
    }

    // redirecting all :- /default_locale/* -> /*
    if (pathname.split('/')[1] === DEFAULT_LOCALE) {
      return redirect_response(get_link(pathname, DEFAULT_LOCALE));
    }
  }

  return resolve(event, {
    transformPageChunk: ({ html }) => {
      return html.replace('%lang%', params.lang ?? DEFAULT_LOCALE);
    }
  });
};

function redirect_response(loc: string) {
  return new Response('Redirect', {
    status: 302,
    headers: { Location: loc }
  });
}
