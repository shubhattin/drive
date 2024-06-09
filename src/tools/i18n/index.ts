import lang_data from '@langs/locales.json';
import { goto } from '$app/navigation';
import { page } from '$app/stores';
import { get } from 'svelte/store';
import type { langKey } from '@langs/datt.server';

export const default_locale = lang_data.default_locale;
export const locales = lang_data.locales;
export const locale_keys = Object.keys(locales) as langKey[];
export const locale_values = Object.values(locales);

/**
 * `import{ page } from '$app/stores'`
 *  and pass `$page.params.lang` if you want to watch the `changes` with `$: {...}`
 * @returns string
 */
export const get_current_locale = (lang = get(page).params.lang) => {
  return lang ?? lang_data.default_locale;
};

/**
 * Extract the locale from the url
 * @param url current url
 * @returns exrtracted locale
 */
export const get_locale_from_url = (url: string) => {
  let parts = url.split('/').slice(1);
  let locale: string = null!; // detected locale
  if (parts[0] in locales) {
    locale = parts[0];
    parts = parts.slice(1);
  }
  return locale ?? default_locale;
};

/**
 * This function detects the change in url and updates the `HTML` tag's `lang` attribute
 */
export const change_html_lang_tag = () => {
  page.subscribe((page) => {
    document.querySelector('html')!.lang = get_current_locale(page.params.lang);
  });
};

/**
 * Returns the link for a given URL and locale.
 *
 * @param {string | null} url - The URL for which to get the link. If null, the current URL is used.
 * @param {string | null} locale - The locale for which to get the link. If null, the current locale is used.
 * @return {string} The link for the given URL and locale.
 */
export const get_link = (url: string | null = null!, locale: string | null = null!): string => {
  if (!url) url = window.location.pathname;
  let parts = url.split('/').slice(1);
  let dec_locale: string = null!; // detected locale
  if (parts[0] in locales) {
    dec_locale = parts[0];
    parts = parts.slice(1);
  }
  let link = parts.join('/');
  // If the locale is not defined then use the current locale to get the link
  if (!locale) locale = get_current_locale();
  // If detected locale is the default locale then it should not be prefixed with the url
  if (locale !== default_locale) link = locale + (link === '' ? '' : '/') + link;
  link = '/' + link;
  return link;
};

export const get_pure_link = (url: string) => {
  return get_link(url, default_locale);
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
};
