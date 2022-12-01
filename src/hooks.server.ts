import type { RequestEvent, Handle } from '@sveltejs/kit';
import { default_locale } from './langs';

export const handle: Handle = ({ event, resolve }) => {
  return resolve(event, {
    transformPageChunk: ({ html }) => {
      return html.replace('%lang%', event.params.lang || default_locale);
    }
  });
};
