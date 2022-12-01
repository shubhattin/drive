import lang_data from '../langs/locales.json';
import { goto } from '$app/navigation';

export const default_locale = lang_data.default_locale;
export const locales = lang_data.locales;

/**
 * `import{ page } from '$app/stores'`
 *  and pass `$page.params.lang`
 * @returns string
 */
export const get_current_locale: (page_lang: string) => string = (page_lang) =>
  page_lang || lang_data.default_locale;

export const get_link = (url: string | null = null!, locale: string | null = null!) => {
  if (!url) url = window.location.pathname;
  let parts = url.split('/').slice(1);
  let dec_locale: string = null!; // detected locale
  if (parts[0] in locales) {
    dec_locale = parts[0];
    parts = parts.slice(1);
  }
  let link = parts.join('/');
  if (locale && locale !== default_locale) link = locale + (link === '' ? '' : '/') + link;
  link = '/' + link;
  return link;
};

export const router_push = (
  url: string | null = null!,
  locale: string | null = null!,
  options: Parameters<typeof goto>[1] = {}
) => {
  goto(get_link(url, locale), options);
};

export const change_locale = (locale: string) => {
  router_push(null, locale, { replaceState: true });
  document.querySelector('html')!.lang = locale;
};
