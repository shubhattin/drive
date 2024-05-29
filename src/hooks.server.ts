import type { Handle } from '@sveltejs/kit';
import { default_locale } from './langs';
import { createContext } from '@api/context';
import { router } from '@api/trpc_router';
import { createTRPCHandle } from 'trpc-sveltekit';

const handle_trpc = createTRPCHandle({ router, createContext });

export const handle: Handle = async ({ event, resolve }) => {
  if (event.url.pathname.startsWith('/trpc')) {
    return handle_trpc({ event, resolve });
  }
  return resolve(event, {
    transformPageChunk: ({ html }) => {
      return html.replace('%lang%', event.params.lang || default_locale);
    }
  });
};
